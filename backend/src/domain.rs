use derive_more::Display;
use serde::{Deserialize, Serialize};
use std::{collections::HashMap, str::FromStr};

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
pub struct AdultId(pub i32);

#[derive(Clone, Copy, Debug, Serialize, Deserialize, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum AdultRole {
    Org,
    Jury,
}

impl Display for AdultRole {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(match self {
            Self::Org => "org",
            Self::Jury => "jury",
        })
    }
}

impl FromStr for AdultRole {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "org" => Ok(Self::Org),
            "jury" => Ok(Self::Jury),
            _ => Err(format!("invalid adult role {s}")),
        }
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct Participant {
    pub id: ParticipantId,
    pub code: String,
    pub jury: Option<Adult>,
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
    pub code: String,
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

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Order {
    Asc,
    Desc,
}

#[derive(Clone, Copy, Debug, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum Sort {
    Id,
    Name,
    District,
    City,
}
