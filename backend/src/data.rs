use crate::domain::*;
use std::{
    collections::HashMap,
    sync::atomic::{AtomicUsize, Ordering},
};
use thiserror::Error;
use tokio::sync::Mutex;

type Result<T, E = DataSourceError> = ::core::result::Result<T, E>;

#[derive(Debug, Error)]
pub enum DataSourceError {
    #[error("invalid participant id `{0}`")]
    ParticipantId(ParticipantId),

    #[error("invalid adult id `{0}`")]
    AdultId(AdultId),

    #[error("adult with name `{0}` is already exists")]
    AdultName(String),
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
                        jury: None,
                        info: ParticipantInfo {
                            name: "name".to_owned(),
                            photo_url: "https://http.cat/images/102.jpg".to_owned(),
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
                        jury: None,
                        info: ParticipantInfo {
                            name: "eman".to_owned(),
                            photo_url: "https://http.cat/images/102.jpg".to_owned(),
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

    pub async fn participants(&self) -> Result<Vec<Participant>> {
        Ok(self.participants.lock().await.values().cloned().collect())
    }

    pub async fn participant(&self, id: ParticipantId) -> Result<Participant> {
        self.participants
            .lock()
            .await
            .get(&id)
            .cloned()
            .ok_or(DataSourceError::ParticipantId(id))
    }

    pub async fn set_participant_command(
        &self,
        id: ParticipantId,
        jury_id: Option<AdultId>,
    ) -> Result<()> {
        let mut participants = self.participants.lock().await;
        let adults = self.adults.lock().await;

        let Some(participant) = participants.get_mut(&id) else {
            return Err(DataSourceError::ParticipantId(id));
        };

        let Some(jury_id) = jury_id else {
            participant.jury = None;
            return Ok(());
        };

        let Some(adult) = adults.get(&jury_id).cloned() else {
            return Err(DataSourceError::AdultId(jury_id));
        };

        participant.jury = Some(adult);

        Ok(())
    }

    pub async fn set_participant_rate(
        &self,
        id: ParticipantId,
        jury_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<()> {
        let mut participants = self.participants.lock().await;

        let Some(participant) = participants.get_mut(&id) else {
            return Err(DataSourceError::ParticipantId(id));
        };

        let Some(jury_rate) = participant.rates.get_mut(&jury_id) else {
            return Err(DataSourceError::AdultId(jury_id));
        };

        *jury_rate = rate;

        Ok(())
    }

    pub async fn adults(&self) -> Result<Vec<Adult>> {
        Ok(self.adults.lock().await.values().cloned().collect())
    }

    pub async fn adult(&self, id: AdultId) -> Result<Option<Adult>> {
        Ok(self.adults.lock().await.get(&id).cloned())
    }

    pub async fn find_adult(&self, name: &str, password: &str) -> Result<Option<Adult>> {
        let adults = self.adults.lock().await;

        let adult = adults
            .values()
            .find(|adult| adult.name == name && adult.password == password)
            .cloned();

        Ok(adult)
    }

    pub async fn adult_role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        let adults = self.adults.lock().await;

        let role = adults.get(&id).map(|adult| adult.role);

        Ok(role)
    }

    pub async fn new_adult(&self, name: String, password: String, role: AdultRole) -> Result<()> {
        let mut adults = self.adults.lock().await;

        for adult in adults.values() {
            if adult.name == name {
                return Err(DataSourceError::AdultName(name));
            }
        }

        let adult_id = self.adult_id.load(Ordering::Relaxed);
        adults.insert(
            AdultId(adult_id),
            Adult {
                id: AdultId(adult_id),
                name,
                password,
                role,
            },
        );
        self.adult_id.store(adult_id + 1, Ordering::Relaxed);

        if matches!(role, AdultRole::Jury) {
            let mut participants = self.participants.lock().await;
            for (_id, participant) in participants.iter_mut() {
                participant.rates.insert(AdultId(adult_id), None);
            }
        }

        Ok(())
    }

    pub async fn delete_adult(&self, id: AdultId) -> Result<()> {
        let mut adults = self.adults.lock().await;
        let mut participants = self.participants.lock().await;

        if !adults.contains_key(&id) {
            return Err(DataSourceError::AdultId(id));
        }

        for participant in participants.values_mut() {
            participant.rates.remove(&id).unwrap_or_else(|| {
                panic!(
                    "adult #{adult_id} does not present in participant #{participant_id} rates",
                    adult_id = id,
                    participant_id = participant.id
                )
            });
        }

        adults.remove(&id).unwrap();

        Ok(())
    }
}
