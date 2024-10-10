use super::BackendState;
use crate::{datasource::DataSource, domain::*};
use anyhow::{bail, Context};
use axum::extract;
use reqwest::StatusCode;
use std::{collections::HashMap, sync::Arc};

type Form = HashMap<String, String>;

const TILDA_API_KEY: &str = "9d5c88ad-c0b2-4c46-908c-78203419a5aa";

pub async fn new_application(
    extract::State(state): extract::State<Arc<BackendState>>,
    extract::Form(application): extract::Form<Form>,
) -> StatusCode {
    if read(&application, "ApiKey") != TILDA_API_KEY {
        return StatusCode::UNAUTHORIZED;
    }

    if read(&application, "test") == "test" {
        return StatusCode::OK;
    }

    let (info, answers) = match extract_application(&application) {
        Ok(application) => application,
        Err(err) => {
            tracing::warn!("Bad application from Tilda: {err:#}");
            return StatusCode::BAD_REQUEST;
        }
    };

    let code = match create_participant(&state.datasource, &info, &answers).await {
        Ok(code) => code,
        Err(err) => {
            tracing::error!("Failed to create participant: {err:#}");
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    };

    send_email_with_code(&state.tokens.notisend, &info.email, &code, &info.name).await;

    StatusCode::OK
}

/// Reads value from form. If key does not exists, returns an empty string.
fn read(form: &Form, key: &str) -> String {
    form.get(key).cloned().unwrap_or_default()
}

/// Reads value from form. If key does not exists, returns an error.
fn try_read(form: &Form, key: &str) -> anyhow::Result<String> {
    form.get(key)
        .cloned()
        .with_context(|| format!("key '{key}' does not exists in form"))
}

fn extract_application(form: &Form) -> anyhow::Result<(ParticipantInfo, ParticipantAnswers)> {
    let info = extract_info(form).context("extracting info")?;
    let answers = extract_answers(form).context("extracting answers")?;

    Ok((info, answers))
}

fn extract_info(form: &Form) -> anyhow::Result<ParticipantInfo> {
    Ok(ParticipantInfo {
        name: try_read(form, "Name")?,
        photo_url: try_read(form, "Фото_участника")?,
        city: try_read(form, "Город")?,
        district: try_read(form, "Регион")?,
        edu_org: try_read(form, "Образовательная_организация")?,
        phone_number: try_read(form, "Phone")?,
        email: try_read(form, "Email")?,
        responsible_adult_name: try_read(form, "Name_2")?,
        responsible_adult_phone_number: try_read(form, "Phone_2")?,
    })
}

fn extract_answers(form: &Form) -> anyhow::Result<ParticipantAnswers> {
    let mut answers = HashMap::with_capacity(4);

    for (key, value) in form {
        let question = if key.starts_with("Расскажи_о_своих_навыках") {
            "Расскажи о своих навыках – что ты умеешь в инженерной или научной деятельности и на каком уровне ты владеешь этими навыками? Что ты умеешь делать лучше других?"
        } else if key.starts_with("Расскажи_о_своих_достижениях") {
            "Расскажи о своих достижениях – о проектах, которые ты реализовал раньше и какую роль ты в этих проектах выполнял?"
        } else if key.starts_with("Расскажи_о_трех_самых") {
            "Расскажи о трех самых ярких конкурсах, в которых ты принимал участие"
        } else if key.starts_with("Как_ты_думаешь") {
            "Как ты думаешь, почему человек летает в космос не дальше орбиты МКС? Почему космические агентства до сих пор не освоили Луну, не долетели до Марса и не научились приземляться на астероиды? Какие направления науки и технологий надо усиленно развивать, чтобы как можно скорее достичь новых горизонтов в космосе?"
        } else {
            continue;
        };

        answers.insert(question.to_owned(), value.to_owned());
    }

    if answers.len() != 4 {
        anyhow::bail!("not enough answers in form ({}/4)", answers.len());
    }

    Ok(answers)
}

async fn create_participant(
    datasource: &DataSource,
    info: &ParticipantInfo,
    answers: &ParticipantAnswers,
) -> anyhow::Result<ParticipantCode> {
    datasource
        .participants
        .create(None, None, info.to_owned(), answers.to_owned(), None)
        .await
        .context("database error")
        .map(|(_, code)| code)
}

async fn send_email_with_code(token: &str, email: &str, code: &str, name: &str) {
    match send_email(token, email, code, name).await {
        Ok(()) => {
            tracing::info!(
                "Successfully send code to participant '{name}' (code '{code}', email '{email}')"
            );
        }
        Err(err) => {
            tracing::info!(
                "Failed to send code to participant '{name}' (code '{code}', email '{email}'): {err:#}"
            );
        }
    }
}

async fn send_email(token: &str, email: &str, code: &str, name: &str) -> anyhow::Result<()> {
    const EMAIL: &str = include_str!("../../../mail/code.html");

    let name = get_name(name);

    let prepared_email_content = EMAIL.replace("NAME", &name).replace("ЯЯ-0000", code);

    let request_body = serde_json::json!({
        "from_email": "info@spacechamp-org.ru",
        "from_name": "Космический Чемпионат 2024",
        "to": email,
        "subject": "Заявка на Космический Чемпионат 2024",
        "text": format!("Твоя заявка на участие в Космическом Чемпионате принята! Твой шифр: {code}"),
        "html": prepared_email_content
    });

    let send_result = reqwest::Client::new()
        .post("https://api.notisend.ru/v1/email/messages")
        .json(&request_body)
        .bearer_auth(token)
        .send()
        .await
        .context("sending 'email/messages' request")?;

    let response = send_result
        .json::<serde_json::Value>()
        .await
        .context("parsing notisend response")?;

    if let Some(errors) = response.get("errors") {
        let errors = errors.as_array().context("invalid notisend response")?;
        let code = errors[0]
            .get("code")
            .and_then(|v| v.as_str())
            .unwrap_or_default();

        let detail = errors[0]
            .get("detail")
            .and_then(|v| v.as_str())
            .unwrap_or_default();

        bail!("notisend error {code}: {detail}");
    }

    let status = response
        .get("status")
        .and_then(|v| v.as_str())
        .unwrap_or_default();

    if status != "queued" {
        bail!("notisend strange status: {status}")
    }

    Ok(())
}

fn get_name(name: &str) -> String {
    name.split(' ').take(2).collect::<Vec<_>>().join(" ")
}
