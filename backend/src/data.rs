use crate::domain::*;
use std::{
    collections::HashMap,
    sync::atomic::{AtomicUsize, Ordering},
};
use thiserror::Error;
use tokio::sync::Mutex;

#[derive(Debug, Error)]
pub enum DataSourceError {
    #[error("invalid participant id `{0}`")]
    InvalidParticipantId(ParticipantId),

    #[error("invalid adult id `{0}`")]
    InvalidAdultId(AdultId),
}

pub struct DataSource {
    participants: Mutex<HashMap<ParticipantId, Participant>>,
    adults: Mutex<HashMap<AdultId, Adult>>,
    adult_id: AtomicUsize,
}

impl DataSource {
    pub fn new() -> Self {
        Self {
            participants: Mutex::new(HashMap::from([
                (
                    ParticipantId(1),
                    Participant {
                        id: ParticipantId(1),
                        jury_id: None,
                        info: ParticipantInfo {
                            name: "name".to_owned(),
                            photo_url: "photo_url".to_owned(),
                            city: "city".to_owned(),
                            district: "district".to_owned(),
                            phone_number: "phone_number".to_owned(),
                            email: "email".to_owned(),
                            edu_org: "edu_org".to_owned(),
                        },
                        answers: HashMap::from([("Вы кот?".to_owned(), "Нет".to_owned())]),
                        rates: HashMap::from([(AdultId(100), None), (AdultId(101), None)]),
                    },
                ),
                (
                    ParticipantId(2),
                    Participant {
                        id: ParticipantId(2),
                        jury_id: None,
                        info: ParticipantInfo {
                            name: "eman".to_owned(),
                            photo_url: "photo_url".to_owned(),
                            city: "city".to_owned(),
                            district: "district".to_owned(),
                            phone_number: "phone_number".to_owned(),
                            email: "email".to_owned(),
                            edu_org: "edu_org".to_owned(),
                        },
                        answers: HashMap::from([("Вы кот?".to_owned(), "КОНЕЧНО".to_owned())]),
                        rates: HashMap::from([(AdultId(100), None), (AdultId(101), None)]),
                    },
                ),
            ])),
            adults: Mutex::new(HashMap::from([
                (
                    AdultId(100),
                    Adult {
                        id: AdultId(100),
                        name: "Ян Трояновский".to_owned(),
                        password: "12345678".to_owned(),
                        role: AdultRole::Org,
                    },
                ),
                (
                    AdultId(101),
                    Adult {
                        id: AdultId(101),
                        name: "Илья Овчинников".to_owned(),
                        password: "87654321".to_owned(),
                        role: AdultRole::Jury,
                    },
                ),
            ])),
            adult_id: AtomicUsize::new(102),
        }
    }

    pub async fn participants(&self) -> Vec<Participant> {
        self.participants.lock().await.values().cloned().collect()
    }

    pub async fn set_participant_command(
        &self,
        id: ParticipantId,
        jury_id: Option<AdultId>,
    ) -> Result<(), DataSourceError> {
        let mut participants = self.participants.lock().await;

        let Some(participant) = participants.get_mut(&id) else {
            return Err(DataSourceError::InvalidParticipantId(id));
        };

        participant.jury_id = jury_id;

        Ok(())
    }

    pub async fn set_participant_rate(
        &self,
        id: ParticipantId,
        jury_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<(), DataSourceError> {
        let mut participants = self.participants.lock().await;

        let Some(participant) = participants.get_mut(&id) else {
            return Err(DataSourceError::InvalidParticipantId(id));
        };

        *participant.rates.get_mut(&jury_id).unwrap() = rate;

        Ok(())
    }

    pub async fn adults(&self) -> Vec<Adult> {
        self.adults.lock().await.values().cloned().collect()
    }

    pub async fn new_adult(&self, name: String, password: String, role: AdultRole) {
        let adult_id = self.adult_id.load(Ordering::Relaxed);
        self.adults
            .lock()
            .await
            .insert(AdultId(adult_id), Adult { id: AdultId(adult_id), name, password, role });
        self.adult_id.store(adult_id + 1, Ordering::Relaxed);

        if matches!(role, AdultRole::Jury) {
            let mut participants = self.participants.lock().await;
            for (_id, participant) in participants.iter_mut() {
                participant.rates.insert(AdultId(adult_id), None);
            }
        }
    }
}
