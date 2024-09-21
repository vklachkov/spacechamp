pub mod auth;
mod error;
mod payloads;
pub mod session_store;

use self::{error::*, payloads::*};
use crate::{
    datasource::{DataSource, DataSourceError},
    domain::*,
};
use anyhow::{bail, Context};
use axum::{
    extract::{Path, Query, State},
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, patch, post},
    Form, Json, Router,
};
use std::{collections::HashMap, sync::Arc};

struct BackendState {
    datasource: Arc<DataSource>,
    tokens: Arc<BackendTokens>,
}

pub struct BackendTokens {
    pub notisend: String,
}

pub fn v1(datasource: Arc<DataSource>, tokens: Arc<BackendTokens>) -> Router {
    let state = BackendState { datasource, tokens };

    Router::new()
        .route("/login", post(login))
        .route("/logout", post(logout))
        .route("/webhook/new_application", post(new_application_webhook))
        .nest(
            "/org",
            Router::new()
                .route("/participants", get(all_participants))
                .route("/participant", post(create_participant))
                .route(
                    "/participant/:id",
                    get(get_participant).delete(delete_participant),
                )
                .route("/participant/:id/info", patch(patch_participant_info))
                .route("/participant/:id/command", post(set_participant_command))
                .route("/adults", get(adults))
                .route("/adult", post(create_adult))
                .route("/adult/:id", delete(delete_adult))
                .route_layer(axum_login::permission_required!(
                    auth::Backend,
                    AdultRole::Org,
                )),
        )
        .nest(
            "/jury",
            Router::new()
                .route("/participants", get(jury_participants))
                .route("/participant/:id", get(get_jury_participant))
                .route("/participant/:id/rate", post(set_participant_rate))
                .route_layer(axum_login::permission_required!(
                    auth::Backend,
                    AdultRole::Jury,
                )),
        )
        .with_state(Arc::new(state))
}

async fn login(
    mut auth_session: auth::AuthSession,
    Json(payload): Json<LoginPayload>,
) -> impl IntoResponse {
    let creds = payload.clone().into();
    let user = match auth_session.authenticate(creds).await {
        Ok(Some(user)) => user,
        Ok(None) => return StatusCode::UNAUTHORIZED.into_response(),
        Err(_) => return StatusCode::INTERNAL_SERVER_ERROR.into_response(),
    };

    if let Err(err) = auth_session.login(&user).await {
        tracing::error!("Failed to login user {user}: {err}", user = user.0.name);
        return StatusCode::INTERNAL_SERVER_ERROR.into_response();
    }

    Json(user.0).into_response()
}

async fn logout(mut auth_session: auth::AuthSession) -> StatusCode {
    match auth_session.logout().await {
        Ok(Some(_)) => StatusCode::OK,
        Ok(None) => StatusCode::UNAUTHORIZED,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

async fn new_application_webhook(
    State(state): State<Arc<BackendState>>,
    Form(application): Form<HashMap<String, String>>,
) -> StatusCode {
    const TILDA_API_KEY: &str = "9d5c88ad-c0b2-4c46-908c-78203419a5aa";

    let get = |key: &str| application.get(key).map(String::as_str).unwrap_or_default();

    if get("ApiKey") != TILDA_API_KEY {
        return StatusCode::UNAUTHORIZED;
    }

    if get("test") == "test" {
        return StatusCode::OK;
    }

    let info = ParticipantInfo {
        name: get("Name").to_owned(),
        photo_url: get("Фото_участника").to_owned(),
        city: get("Город").to_owned(),
        district: get("Регион").to_owned(),
        edu_org: get("Образовательная_организация").to_owned(),
        phone_number: get("Phone").to_owned(),
        email: get("Email").to_owned(),
        responsible_adult_name: get("Name_2").to_owned(),
        responsible_adult_phone_number: get("Phone_2").to_owned(),
    };

    let answers = HashMap::from([
        (
            "Расскажи о своих навыках – что ты умеешь в инженерной или научной деятельности и на каком уровне ты владеешь этими навыками? Что ты умеешь делать лучше других?".to_owned(),
            get("Расскажи_о_своих_навыках__что_ты_умеешь_в_инженерной_или_научной_деятельности_и_на_каком_уровне_ты_владеешь_этими_навыками_Что_ты_умеешь_делать_лучше_других").to_owned(),
        ),
        (
            "Расскажи о своих достижениях – о проектах, которые ты реализовал раньше и какую роль ты в этих проектах выполнял?".to_owned(),
            get("Расскажи_о_своих_достижениях__о_проектах_которые_ты_реализовал_раньше_и_какую_роль_ты_в_этих_проектах_выполнял").to_owned(),
        ),
        (
            "Расскажи о трех самых ярких конкурсах, в которых ты принимал участие".to_owned(),
            get("Расскажи_о_трех_самых_ярких_конкурсах_в_которых_ты_принимал_участие").to_owned(),
        ),
        (
            "Как ты думаешь, почему человек летает в космос не дальше орбиты МКС? Почему космические агентства до сих пор не освоили Луну, не долетели до Марса и не научились приземляться на астероиды? Какие направления науки и технологий надо усиленно развивать, чтобы как можно скорее достичь новых горизонтов в космосе?".to_owned(),
            get("Как_ты_думаешь_почему_человек_летает_в_космос_не_дальше_орбиты_МКС_Почему_космические_агентства_до_сих_пор_не_освоили_Луну_не_долетели_до_Марса_и_не_научились_приземляться_на_астероиды_Какие_направления_науки_и_технологий_надо_усиленно_развивать_чтобы_как_можно_скорее_достичь_новых_горизонтов_в_космосе").to_owned(),
        ),
    ]);

    let id = match state.datasource.create_participant(None, None, info, answers, None).await {
        Ok((id, _)) => id,
        Err(err) => {
            tracing::error!("Failed to create participant from webhook: {err}");
            return StatusCode::INTERNAL_SERVER_ERROR;
        }
    };

    if let Ok(Some(participant)) = state.datasource.get_participant(id).await {
        send_email_with_code(state, participant).await;
    }

    StatusCode::OK
}

async fn send_email_with_code(state: Arc<BackendState>, participant: Participant) {
    match send_email(&state.tokens.notisend, &participant).await {
        Ok(()) => {
            tracing::info!(
                "Successfully send code to participant '{name}' (code '{code}', email '{email}')",
                name = participant.info.name,
                code = participant.code,
                email = participant.info.email,
            );
        }
        Err(err) => {
            tracing::info!(
                "Failed to send code to participant '{name}' (code '{code}', email '{email}'): {err:#}",
                name = participant.info.name,
                code = participant.code,
                email = participant.info.email,
            );
        }
    }
}

async fn send_email(token: &str, participant: &Participant) -> anyhow::Result<()> {
    const EMAIL: &str = include_str!("../../mail/code.html");

    let email = &participant.info.email;
    let name = get_name(&participant.info.name);
    let code = &participant.code;

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

async fn all_participants(
    State(state): State<Arc<BackendState>>,
    Query(GetParticipantsQuery { sort }): Query<GetParticipantsQuery>,
) -> Result<Json<Vec<Participant>>> {
    Ok(Json(state.datasource.get_all_participants(sort).await?))
}

async fn create_participant(
    State(state): State<Arc<BackendState>>,
    Json(payload): Json<NewParticipantPayload>,
) -> Result<()> {
    let NewParticipantPayload {
        code,
        jury,
        info,
        answers,
        rates,
    } = payload;

    state
        .datasource
        .create_participant(code, jury, info, answers, rates)
        .await
        .map(|_| ())
        .map_err(Into::into)
}

async fn get_participant(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<Json<Participant>> {
    if let Some(participant) = state.datasource.get_participant(id).await? {
        Ok(Json(participant))
    } else {
        Err(ApiError::DataSource(DataSourceError::UnknownParticipant(
            id,
        )))
    }
}

async fn delete_participant(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<()> {
    let authed_user_id = auth_session.user.unwrap().0.id;
    state
        .datasource
        .delete_participant(id, authed_user_id)
        .await
        .map_err(Into::into)
}

async fn patch_participant_info(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(info): Json<ParticipantInfo>,
) -> Result<()> {
    state
        .datasource
        .update_participant_info(id, info)
        .await
        .map_err(Into::into)
}

async fn set_participant_command(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(SetParticipantCommandPayload { jury_id }): Json<SetParticipantCommandPayload>,
) -> Result<()> {
    state
        .datasource
        .set_participant_command(id, jury_id)
        .await
        .map_err(Into::into)
}

async fn adults(State(state): State<Arc<BackendState>>) -> Result<Json<Vec<Adult>>> {
    Ok(Json(state.datasource.get_all_adults().await?))
}

async fn create_adult(
    State(state): State<Arc<BackendState>>,
    Json(NewAdultPayload {
        name,
        password,
        role,
    }): Json<NewAdultPayload>,
) -> Result<()> {
    state
        .datasource
        .new_adult(name, password, role)
        .await
        .map_err(Into::into)
}

async fn delete_adult(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<AdultId>,
) -> Result<()> {
    let authed_user_id = auth_session.user.unwrap().0.id;
    if authed_user_id == id {
        return Err(ApiError::InvalidParameter(
            "can not delete yourself".to_owned(),
        ));
    }

    state.datasource.delete_adult(id).await.map_err(Into::into)
}

async fn jury_participants(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Query(GetParticipantsQuery { sort }): Query<GetParticipantsQuery>,
) -> Result<Json<Vec<AnonymousParticipant>>> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    Ok(Json(
        state
            .datasource
            .get_all_participants(sort)
            .await?
            .into_iter()
            .filter(|p| {
                p.jury
                    .as_ref()
                    .map(|jury| jury.id == jury_id)
                    .unwrap_or(true)
            })
            .map(|mut p| AnonymousParticipant {
                id: p.id,
                code: p.code,
                in_command: p.jury.is_some(),
                answers: p.answers,
                rate: p.rates.remove(&jury_id).flatten(),
            })
            .collect(),
    ))
}

async fn get_jury_participant(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<Json<AnonymousParticipant>> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    let Some(mut participant) = state.datasource.get_participant(id).await? else {
        return Err(ApiError::from(DataSourceError::UnknownParticipant(id)));
    };

    if participant
        .jury
        .as_ref()
        .is_some_and(|jury| jury.id != jury_id)
    {
        return Err(ApiError::from(DataSourceError::UnknownParticipant(id)));
    }

    Ok(Json(AnonymousParticipant {
        id: participant.id,
        code: participant.code,
        in_command: participant.jury.is_some(),
        answers: participant.answers,
        rate: participant
            .rates
            .remove(&jury_id)
            .expect("rates for jury should be presented"),
    }))
}

async fn set_participant_rate(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(payload): Json<SetParticipantRate>,
) -> Result<()> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    state
        .datasource
        .set_participant_rate(id, jury_id, payload.rate)
        .await
        .map_err(Into::into)
}
