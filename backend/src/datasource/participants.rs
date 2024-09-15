use super::result::Result;
use crate::domain::*;
use diesel::PgConnection;
use std::sync::{Arc, Mutex};

pub(crate) struct Participants {
    conn: Arc<Mutex<PgConnection>>,
}

impl Participants {
    pub fn new(conn: Arc<Mutex<PgConnection>>) -> Self {
        Self { conn }
    }

    pub async fn get(&self, id: ParticipantId) -> Result<Option<Participant>> {
        unimplemented!()
    }

    pub async fn get_all(&self) -> Result<Vec<Participant>> {
        unimplemented!()
    }

    pub async fn set_adult(&self, id: ParticipantId, adult_id: Option<AdultId>) -> Result<()> {
        unimplemented!()
    }

    pub async fn set_adult_rate(
        &self,
        id: ParticipantId,
        adult_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<()> {
        unimplemented!()
    }
}
