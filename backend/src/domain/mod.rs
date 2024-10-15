mod adult;
mod operations;
mod participant;

pub use adult::{Adult, AdultId, AdultRole};
pub use operations::{Order, Sort};
pub use participant::{
    JuryParticipant, Participant, ParticipantAnswers, ParticipantCode, ParticipantId,
    ParticipantInfo, ParticipantRate,
};

pub const MAX_PARTICIPANTS_IN_JURY: usize = 23;
