use derive_more::Display;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Adult {
    pub id: AdultId,
    pub name: String,
    pub password: String,
    pub role: AdultRole,
}

#[derive(
    Clone, Copy, Display, Debug, Serialize, Deserialize, PartialEq, Eq, PartialOrd, Ord, Hash,
)]
#[serde(transparent)]
pub struct AdultId(pub usize);

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum AdultRole {
    Org,
    Jury,
}

#[derive(Clone, Debug, Serialize)]
pub struct Participant {
    pub id: ParticipantId,
    pub jury: Option<Adult>,
    pub info: ParticipantInfo,
    pub answers: HashMap<String, String>,
    pub rates: HashMap<AdultId, Option<ParticipantRate>>,
}

#[derive(Clone, Debug, Serialize)]
pub struct ParticipantInfo {
    pub name: String,
    pub photo_url: String,
    pub city: String,
    pub district: String,
    pub phone_number: String,
    pub email: String,
    pub edu_org: String,
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
pub struct ParticipantId(pub usize);

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct ParticipantRate {
    pub salary: usize,
    pub comment: String,
}
