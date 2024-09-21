use std::collections::HashMap;

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
pub struct NewParticipantPayload {
    pub info: ParticipantInfo,
    pub answers: HashMap<String, String>,
}

#[derive(Deserialize)]
pub struct SetParticipantCommandPayload {
    pub jury_id: Option<AdultId>,
}

#[derive(Deserialize)]
pub struct SetParticipantRate {
    #[serde(flatten)]
    pub rate: Option<ParticipantRate>,
}

#[derive(Deserialize)]
pub struct NewAdultPayload {
    pub name: String,
    pub password: String,
    pub role: AdultRole,
}

#[derive(Deserialize)]
pub struct GetParticipantsQuery {
    pub sort: Sort,
}
