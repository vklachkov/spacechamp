use crate::{
    api::{error::*, BackendState},
    datasource::DataSource,
    domain::*,
};
use anyhow::Context;
use axum::{
    extract::State,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use reqwest::Url;
use serde::Serialize;
use std::{collections::HashMap, sync::Arc};

#[derive(Serialize)]
struct Report {
    pub bureaus: Vec<Bureau>,
    pub bureaus_participants_count: HashMap<Bureau, usize>,
    pub max_participants_per_bureau: usize,
    pub salaries: Vec<ParticipantSalaries>,
}

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[rustfmt::skip]
enum Bureau {
    #[serde(rename = "1D")] OneD,
    #[serde(rename = "Салют")] Salut,
    #[serde(rename = "Звёздное")] Zvezdnoe,
    #[serde(rename = "Родное")] Rodnoe,
    #[serde(rename = "Око")] Oko,
}

impl Bureau {
    pub fn all() -> [Bureau; 5] {
        use Bureau::*;
        [OneD, Salut, Zvezdnoe, Rodnoe, Oko]
    }

    fn from_jury(name: &str) -> Option<Self> {
        match name {
            "Матюхин Андрей" => Some(Self::OneD),
            "Кириевский Дмитрий" => Some(Self::Salut),
            "Каменева Вероника" => Some(Self::Zvezdnoe),
            "Овчинников Илья" => Some(Self::Rodnoe),
            "Калинкин Александр" => Some(Self::Oko),
            _ => None,
        }
    }

    fn jury(self) -> &'static str {
        match self {
            Self::OneD => "Матюхин Андрей",
            Self::Salut => "Кириевский Дмитрий",
            Self::Zvezdnoe => "Каменева Вероника",
            Self::Rodnoe => "Овчинников Илья",
            Self::Oko => "Калинкин Александр",
        }
    }
}

#[derive(Serialize)]
struct ParticipantSalaries {
    pub code: String,
    pub bureaus: HashMap<Bureau, Option<i32>>,
}

pub async fn build_report(State(state): State<Arc<BackendState>>) -> Result<Response> {
    let participants = get_participants(&state.datasource).await?;

    let bureaus_participants_count = count_participants(&participants);

    let adults = state.datasource.adults.get_all().await?;
    let salaries = code_salaries(&participants, &adults);

    let report = Report {
        bureaus: Bureau::all().to_vec(),
        bureaus_participants_count,
        max_participants_per_bureau: MAX_PARTICIPANTS_IN_JURY,
        salaries,
    };

    let response = match get_report(&state.services.report_generator, report).await {
        Ok(pdf) => ([(axum::http::header::CONTENT_TYPE, "application/pdf")], pdf).into_response(),
        Err(err) => {
            tracing::error!("Failed to generate pdf report: {err:#}");
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };

    Ok(response)
}

async fn get_participants(datasource: &DataSource) -> Result<Vec<Participant>> {
    datasource
        .participants
        .get_all(None, Sort::Id, Order::Asc, false)
        .await
        .map_err(Into::into)
}

fn count_participants(participants: &[Participant]) -> HashMap<Bureau, usize> {
    let bureau = Bureau::all().into_iter().map(|b| (b, 0)).collect();

    participants.iter().fold(bureau, |mut acc, p| {
        if let Some(bureau) = p.jury.as_ref().and_then(|j| Bureau::from_jury(&j.name)) {
            *acc.entry(bureau).or_default() += 1;
        }

        acc
    })
}

fn code_salaries(participants: &[Participant], adults: &[Adult]) -> Vec<ParticipantSalaries> {
    let adult_ids = adults
        .iter()
        .map(|adult| (adult.name.as_str(), adult.id))
        .collect::<HashMap<&str, AdultId>>();

    participants
        .iter()
        .filter(|p| p.jury.is_none())
        .map(|p| ParticipantSalaries {
            code: p.code.clone(),
            bureaus: Bureau::all()
                .into_iter()
                .map(|b| {
                    let adult_id = adult_ids[b.jury()];
                    let rate = p.rates.get(&adult_id).and_then(Option::as_ref);
                    (b, rate.map(|r| r.salary))
                })
                .collect(),
        })
        .collect()
}

async fn get_report(url: &Url, report: Report) -> anyhow::Result<Vec<u8>> {
    reqwest::Client::new()
        .post(url.to_owned())
        .json(&report)
        .send()
        .await
        .context("sending request")?
        .bytes()
        .await
        .context("receiving pdf")
        .map(Into::into)
}
