use super::result::{DataSourceError, Result};
use crate::domain::*;
use std::collections::HashMap;
use tokio::{sync::Mutex, time::Instant};

pub(crate) struct Participants {
    cache: Mutex<HashMap<ParticipantId, Participant>>,
    cache_instant: Instant,
}

impl Participants {
    pub fn new() -> Self {
        Self {
            cache: Default::default(),
            cache_instant: Instant::now(),
        }
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
