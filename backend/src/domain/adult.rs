use derive_more::Display;
use serde::{Deserialize, Serialize};
use std::str::FromStr;

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
