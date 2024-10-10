use crate::{
    api::{error::*, BackendState},
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
struct AnonymousRate {
    pub code: String,
    pub rates: HashMap<&'static str, Option<i32>>,
}

pub async fn build_report(State(state): State<Arc<BackendState>>) -> Result<Response> {
    let participants = state
        .datasource
        .participants
        .get_all(None, Sort::Id, Order::Asc, false)
        .await?;

    let adults = state.datasource.adults.get_all().await?;

    let get_design_bureau_rate = |participant: &Participant, adult_name: &str| {
        adults
            .iter()
            .find(|adult| adult.name == adult_name)
            .map(|adult| adult.id)
            .and_then(|adult_id| participant.rates.get(&adult_id).cloned())
            .flatten()
            .map(|rate| rate.salary)
    };

    let data = participants
        .into_iter()
        .filter(|p| p.jury.is_none())
        .map(|p| AnonymousRate {
            rates: HashMap::from_iter([
                ("1D", get_design_bureau_rate(&p, "Матюхин Андрей")),
                ("Салют", get_design_bureau_rate(&p, "Кириевский Дмитрий")),
                ("Звёздное", get_design_bureau_rate(&p, "Каменева Вероника")),
                ("Родное", get_design_bureau_rate(&p, "Овчинников Илья")),
                ("Око", get_design_bureau_rate(&p, "Калинкин Александр")),
            ]),
            code: p.code,
        })
        .collect();

    let response = match get_report(&state.services.report_generator, data).await {
        Ok(pdf) => ([(axum::http::header::CONTENT_TYPE, "application/pdf")], pdf).into_response(),
        Err(err) => {
            tracing::error!("Failed to generate pdf report: {err:#}");
            StatusCode::INTERNAL_SERVER_ERROR.into_response()
        }
    };

    Ok(response)
}

async fn get_report(url: &Url, data: Vec<AnonymousRate>) -> anyhow::Result<Vec<u8>> {
    reqwest::Client::new()
        .post(url.to_owned())
        .json(&data)
        .send()
        .await
        .context("sending request")?
        .bytes()
        .await
        .context("receiving pdf")
        .map(Into::into)
}
