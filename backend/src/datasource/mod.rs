mod adults;
mod participants;
mod result;

pub use self::result::DataSourceError;

use self::{adults::Adults, participants::Participants, result::Result};
use crate::domain::*;

pub struct DataSource {
    participants: Participants,
    adults: Adults,
}

impl DataSource {
    pub fn new() -> Self {
        Self {
            participants: Participants::new(),
            adults: Adults::new(),
        }
    }

    pub async fn get_participant(&self, id: ParticipantId) -> Result<Option<Participant>> {
        self.participants.get(id).await
    }

    pub async fn get_all_participants(&self) -> Result<Vec<Participant>> {
        self.participants.get_all().await
    }

    pub async fn set_participant_command(
        &self,
        id: ParticipantId,
        adult_id: Option<AdultId>,
    ) -> Result<()> {
        self.participants.set_adult(id, adult_id).await
    }

    pub async fn set_participant_rate(
        &self,
        id: ParticipantId,
        adult_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<()> {
        self.participants.set_adult_rate(id, adult_id, rate).await
    }

    pub async fn get_adult(&self, id: AdultId) -> Result<Option<Adult>> {
        self.adults.get(id).await
    }

    pub async fn get_all_adults(&self) -> Result<Vec<Adult>> {
        self.adults.get_all().await
    }

    pub async fn find_adult(&self, name: &str, password: &str) -> Result<Option<Adult>> {
        self.adults.find(name, password).await
    }

    pub async fn get_adult_role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        self.adults.role(id).await
    }

    pub async fn new_adult(&self, name: String, password: String, role: AdultRole) -> Result<()> {
        self.adults.create(name, password, role).await
    }

    pub async fn delete_adult(&self, id: AdultId) -> Result<()> {
        self.adults.delete(id).await
    }
}
