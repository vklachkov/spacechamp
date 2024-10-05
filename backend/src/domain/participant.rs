use super::{Adult, AdultId};
use derive_more::Display;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize)]
pub struct Participant {
    pub id: ParticipantId,
    pub code: String,
    pub jury: Option<Adult>,
    pub deleted_by: Option<Adult>,
    pub info: ParticipantInfo,
    pub answers: HashMap<String, String>,
    pub rates: HashMap<AdultId, Option<ParticipantRate>>,
}

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ParticipantInfo {
    pub name: String,
    pub photo_url: String,
    pub city: String,
    pub district: String,
    pub edu_org: String,
    pub phone_number: String,
    pub email: String,
    pub responsible_adult_name: String,
    pub responsible_adult_phone_number: String,
}

#[derive(Clone, Debug, Serialize)]
pub struct AnonymousParticipant {
    pub id: ParticipantId,
    pub in_command: bool,
    pub answers: HashMap<String, String>,
    pub rate: Option<ParticipantRate>,
}

#[derive(
    Clone, Copy, Display, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash,
)]
#[serde(transparent)]
pub struct ParticipantId(pub i32);

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ParticipantRate {
    pub salary: i32,
    pub comment: String,
}
