use super::{Adult, AdultId};
use derive_more::Display;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Clone, Debug, Serialize)]
pub struct Participant {
    pub id: ParticipantId,
    pub code: ParticipantCode,
    pub jury: Option<Adult>,
    pub deleted_by: Option<Adult>,
    pub has_call: bool,
    pub info: ParticipantInfo,
    pub answers: ParticipantAnswers,
    pub rates: HashMap<AdultId, Option<ParticipantRate>>,
}

pub type ParticipantCode = String;

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

pub type ParticipantAnswers = HashMap<String, String>;

#[derive(Clone, Debug, Serialize)]
pub struct JuryParticipant {
    pub id: ParticipantId,
    pub in_command: bool,
    pub info: Option<ParticipantInfo>,
    pub answers: ParticipantAnswers,
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
