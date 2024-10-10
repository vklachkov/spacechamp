use crate::{
    api::{auth, error::*, payloads::*, BackendState},
    datasource::DataSourceError,
    domain::*,
};
use axum::{
    extract::{Path, Query, State},
    Json,
};
use std::sync::Arc;

pub async fn all_participants(
    State(state): State<Arc<BackendState>>,
    Query(GetParticipantsQuery {
        search,
        sort,
        order,
        deleted,
    }): Query<GetParticipantsQuery>,
) -> Result<Json<Vec<Participant>>> {
    Ok(Json(
        state
            .datasource
            .participants
            .get_all(search, sort, order, deleted)
            .await?,
    ))
}

pub async fn create_participant(
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
        .participants
        .create(code, jury, info, answers, rates)
        .await
        .map(|_| ())
        .map_err(Into::into)
}

pub async fn get_participant(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<Json<Participant>> {
    if let Some(participant) = state.datasource.participants.get(id).await? {
        Ok(Json(participant))
    } else {
        Err(ApiError::DataSource(DataSourceError::UnknownParticipant(
            id,
        )))
    }
}

pub async fn delete_participant(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<()> {
    let authed_user_id = auth_session.user.unwrap().0.id;
    state
        .datasource
        .participants
        .delete(id, authed_user_id)
        .await
        .map_err(Into::into)
}

pub async fn patch_participant(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(UpdateParticipantPayload { info, answers }): Json<UpdateParticipantPayload>,
) -> Result<()> {
    state
        .datasource
        .participants
        .patch(id, info, answers)
        .await
        .map_err(Into::into)
}

pub async fn set_command(
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(SetParticipantCommandPayload { jury_id }): Json<SetParticipantCommandPayload>,
) -> Result<()> {
    state
        .datasource
        .participants
        .set_jury(id, jury_id)
        .await
        .map_err(Into::into)
}

pub async fn all_adults(State(state): State<Arc<BackendState>>) -> Result<Json<Vec<Adult>>> {
    Ok(Json(state.datasource.adults.get_all().await?))
}

pub async fn create_adult(
    State(state): State<Arc<BackendState>>,
    Json(NewAdultPayload {
        name,
        password,
        role,
    }): Json<NewAdultPayload>,
) -> Result<()> {
    state
        .datasource
        .adults
        .create(name, password, role)
        .await
        .map_err(Into::into)
}

pub async fn delete_adult(
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

    state.datasource.adults.delete(id).await.map_err(Into::into)
}
