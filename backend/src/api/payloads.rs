use crate::domain::*;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct SetParticipantCommandPayload {
    pub participant_id: ParticipantId,
    pub jury_id: Option<AdultId>,
}

#[derive(Deserialize)]
pub struct JuryParticipantsPayload {
    pub jury_id: AdultId,
}

#[derive(Deserialize)]
pub struct SetParticipantRate {
    pub jury_id: AdultId,
    pub id: ParticipantId,
    pub rate: Option<ParticipantRate>,
}
