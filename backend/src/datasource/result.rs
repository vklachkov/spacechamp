use crate::domain::*;
use thiserror::Error;

pub(crate) type Result<T, E = DataSourceError> = ::core::result::Result<T, E>;

#[derive(Debug, Error)]
pub enum DataSourceError {
    #[error("invalid participant id `{0}`")]
    ParticipantId(ParticipantId),

    #[error("invalid adult id `{0}`")]
    AdultId(AdultId),

    #[error("adult with name `{0}` is already exists")]
    AdultName(String),
}
