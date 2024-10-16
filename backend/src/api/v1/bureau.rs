use crate::{
    api::{error::Result, BackendState},
    domain::*,
};
use axum::{extract::State, Json};
use std::{collections::HashMap, sync::Arc};

pub async fn juries() -> Json<HashMap<&'static str, Bureau>> {
    Json(Bureau::all().into_iter().map(|b| (b.jury(), b)).collect())
}

pub async fn stats(
    State(state): State<Arc<BackendState>>,
) -> Result<Json<HashMap<Bureau, BureauStats>>> {
    let participants = state
        .datasource
        .participants
        .get_all(None, Sort::Id, Order::Asc, false)
        .await?;

    let mut bureaus = Bureau::all()
        .into_iter()
        .map(|b| (b, BureauStats::default()))
        .collect::<HashMap<_, _>>();

    for p in participants {
        if let Some(bureau) = p.jury.as_ref().and_then(|j| Bureau::from_jury(&j.name)) {
            bureaus.get_mut(&bureau).unwrap().participants += 1;
        }
    }

    Ok(Json(bureaus))
}
