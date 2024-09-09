pub mod auth;
mod error;
mod payloads;

use self::{error::*, payloads::*};
use crate::{data::DataSource, domain::*};
use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post},
    Json, Router,
};
use serde_json::json;
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

    Json(json!({ "role": user.0.role })).into_response()
}

async fn all_participants(
    State(state): State<Arc<BackendState>>,
) -> Result<Json<Vec<Participant>>> {
    Ok(Json(state.datasource.participants().await))
}

async fn set_participant_command(
    State(state): State<Arc<BackendState>>,
    Json(payload): Json<SetParticipantCommandPayload>,
) -> Result<()> {
    state
        .datasource
        .set_participant_command(payload.participant_id, payload.jury_id)
        .await
        .map_err(Into::into)
}

async fn adults(State(state): State<Arc<BackendState>>) -> Result<Json<Vec<Adult>>> {
    Ok(Json(state.datasource.adults().await))
}

async fn create_adult(
    State(state): State<Arc<BackendState>>,
    Json(adult): Json<Adult>,
) -> Result<()> {
    state.datasource.new_adult(adult).await;
    Ok(())
}

async fn delete_adult() -> StatusCode {
    StatusCode::INTERNAL_SERVER_ERROR
}

async fn jury_participants(
    State(state): State<Arc<BackendState>>,
    Json(hack): Json<JuryParticipantsPayload>,
) -> Result<Json<Vec<AnonymousParticipant>>> {
    Ok(Json(
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
    ))
}

async fn set_participant_rate(
    State(state): State<Arc<BackendState>>,
    Json(payload): Json<SetParticipantRate>,
) -> Result<()> {
    state
        .datasource
        .set_participant_rate(payload.id, payload.jury_id, payload.rate)
        .await
        .map_err(Into::into)
}
