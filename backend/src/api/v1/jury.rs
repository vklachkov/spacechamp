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

pub async fn stats(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
) -> Result<Json<BureauStats>> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    let participants = state
        .datasource
        .participants
        .get_all(None, Sort::Id, Order::Asc, false)
        .await?;

    let count = participants
        .into_iter()
        .filter(|p| p.jury.as_ref().is_some_and(|jury| jury.id == jury_id))
        .count();

    Ok(Json(BureauStats {
        participants: count,
        max_participants: MAX_PARTICIPANTS_PER_BUREAU,
    }))
}

pub async fn all_participants(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Query(GetJuryParticipantsQuery { order }): Query<GetJuryParticipantsQuery>,
) -> Result<Json<Vec<JuryParticipant>>> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    let participants = state
        .datasource
        .participants
        .get_all(None, Sort::Id, order, false)
        .await?;

    let participants = participants
        .into_iter()
        .filter(|p| is_free_or_in_team(p, jury_id))
        .map(|p| rebuild_participant(p, jury_id))
        .collect();

    Ok(Json(participants))
}

pub async fn get_participant(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
) -> Result<Json<JuryParticipant>> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    let Some(participant) = state.datasource.participants.get(id).await? else {
        return Err(ApiError::from(DataSourceError::UnknownParticipant(id)));
    };

    if !is_free_or_in_team(&participant, jury_id) {
        return Err(ApiError::from(DataSourceError::UnknownParticipant(id)));
    }

    Ok(Json(rebuild_participant(participant, jury_id)))
}

fn is_free_or_in_team(participant: &Participant, jury_id: AdultId) -> bool {
    let Some(ref jury) = participant.jury else {
        return true; // Участник не находится ни в чьей команде.
    };

    jury.id == jury_id
}

fn rebuild_participant(participant: Participant, jury_id: AdultId) -> JuryParticipant {
    assert!(is_free_or_in_team(&participant, jury_id));

    let Participant {
        id,
        info,
        jury,
        answers,
        mut rates,
        ..
    } = participant;

    JuryParticipant {
        id,
        in_command: jury.is_some(),
        info: jury.is_some().then_some(info),
        answers,
        rate: rates
            .remove(&jury_id)
            .expect("rate for jury should be presented"),
    }
}

pub async fn set_rate(
    auth_session: auth::AuthSession,
    State(state): State<Arc<BackendState>>,
    Path(id): Path<ParticipantId>,
    Json(payload): Json<SetParticipantRate>,
) -> Result<()> {
    let jury_id = auth_session.user.as_ref().unwrap().0.id;

    state
        .datasource
        .participants
        .set_jury_rate(id, jury_id, payload.rate)
        .await
        .map_err(Into::into)
}
