use crate::domain::*;
use serde::Deserialize;

use super::auth;

#[derive(Clone, Deserialize)]
pub struct LoginPayload {
    pub name: String,
    pub password: String,
}

impl From<LoginPayload> for auth::Credentials {
    fn from(payload: LoginPayload) -> Self {
        Self {
            name: payload.name,
            password: payload.password,
        }
    }
}

#[derive(Deserialize)]
pub struct SetParticipantCommandPayload {
    pub participant_id: ParticipantId,
    pub jury_id: Option<AdultId>,
}

#[derive(Deserialize)]
pub struct SetParticipantRate {
    pub id: ParticipantId,
    pub rate: Option<ParticipantRate>,
}
