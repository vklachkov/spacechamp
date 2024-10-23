mod adult;
mod bureau;
mod operations;
mod participant;

pub use adult::{Adult, AdultId, AdultRole};
pub use bureau::{Bureau, BureauStats};
pub use operations::{Order, Sort};
pub use participant::{
    JuryParticipant, Participant, ParticipantAnswers, ParticipantCode, ParticipantId,
    ParticipantInfo, ParticipantRate,
};

pub const MAX_PARTICIPANTS_PER_BUREAU: usize = 24;
