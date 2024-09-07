use crate::{data::DataSource, domain::*};
use axum::{
    extract::State,
    http::StatusCode,
    routing::{get, post},
    Json, Router,
};
use serde::Deserialize;
use std::sync::Arc;

struct BackendState {
    datasource: DataSource,
}

pub fn v1() -> Router {
    let state = BackendState {
        datasource: DataSource::new(),
    };

    Router::new()
        .route("/login", post(login))
        .nest(
            "/org",
            Router::new()
                .route("/participants", get(all_participants))
                .route("/participants/command", post(set_participant_command))
                .route("/adults", get(adults))
                .route("/adult", post(create_adult).delete(delete_adult)),
        )
        .nest(
            "/jury",
            Router::new()
                .route("/participants", get(jury_participants))
                .route("/participant/rate", post(set_participant_rate)),
        )
        .with_state(Arc::new(state))
}

async fn login() {}

async fn all_participants(State(state): State<Arc<BackendState>>) -> Json<Vec<Participant>> {
    Json(state.datasource.participants().await)
}

#[derive(Deserialize)]
struct SetParticipantCommandPayload {
    participant_id: ParticipantId,
    jury_id: Option<AdultId>,
}

async fn set_participant_command(
    State(state): State<Arc<BackendState>>,
    Json(payload): Json<SetParticipantCommandPayload>,
) {
    state
        .datasource
        .set_participant_command(payload.participant_id, payload.jury_id)
        .await
        .unwrap();
}

async fn adults(State(state): State<Arc<BackendState>>) -> Json<Vec<Adult>> {
    Json(state.datasource.adults().await)
}

#[derive(Deserialize)]
pub struct CreateAdultPayload {
    pub name: String,
    pub password: String,
    pub role: AdultRole,
}

async fn create_adult(State(state): State<Arc<BackendState>>, Json(adult): Json<CreateAdultPayload>) {
    state.datasource.new_adult(adult.name, adult.password, adult.role).await;
}

async fn delete_adult() -> StatusCode {
    StatusCode::INTERNAL_SERVER_ERROR
}

#[derive(Deserialize)]
struct JuryParticipantsPayload {
    jury_id: AdultId,
}

async fn jury_participants(
    State(state): State<Arc<BackendState>>,
    Json(hack): Json<JuryParticipantsPayload>,
) -> Json<Vec<AnonymousParticipant>> {
    Json(
        state
            .datasource
            .participants()
            .await
            .into_iter()
            .filter(|p| p.jury_id == Some(hack.jury_id) || p.jury_id.is_none())
            .map(|mut p| AnonymousParticipant {
                id: p.id,
                in_command: p.jury_id.is_some(),
                answers: p.answers,
                rate: p.rates.remove(&hack.jury_id).flatten(),
            })
            .collect(),
    )
}

#[derive(Deserialize)]
struct SetParticipantRate {
    jury_id: AdultId,
    id: ParticipantId,
    rate: Option<ParticipantRate>,
}

async fn set_participant_rate(
    State(state): State<Arc<BackendState>>,
    Json(payload): Json<SetParticipantRate>,
) {
    state
        .datasource
        .set_participant_rate(payload.id, payload.jury_id, payload.rate)
        .await
        .unwrap();
}
