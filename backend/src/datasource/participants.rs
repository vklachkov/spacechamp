use super::{
    models,
    result::{DataSourceError, Result},
    schema,
};
use crate::domain::*;
use diesel::{prelude::*, result::Error as DieselError};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

pub(crate) struct Participants {
    conn: Arc<Mutex<PgConnection>>,
}

impl Participants {
    pub fn new(conn: Arc<Mutex<PgConnection>>) -> Self {
        Self { conn }
    }

    pub async fn create(
        &self,
        code: Option<String>,
        jury: Option<Adult>,
        info: ParticipantInfo,
        answers: HashMap<String, String>,
        rates: Option<HashMap<AdultId, Option<ParticipantRate>>>,
    ) -> Result<()> {
        self.transact(move |conn| {
            use schema::{
                adults::{self},
                participant_rates as rates, participants,
            };

            let (participant_id, participant_code): (i32, String) =
                diesel::insert_into(participants::table)
                    .values(super::models::NewParticipant::new(info, answers))
                    .returning((participants::id, participants::code))
                    .get_result(conn)?;

            // TODO: Combine select and insert.
            let jury_ids: Vec<i32> = adults::table
                .select(adults::id)
                .order_by(adults::id.asc())
                .filter(adults::role.eq(AdultRole::Jury.to_string()))
                .load(conn)?;

            let records = jury_ids
                .into_iter()
                .map(|jury_id| {
                    let (salary, comment) = rates
                        .as_ref()
                        .and_then(|rates| rates.get(&AdultId(jury_id)).cloned().flatten())
                        .map(|ParticipantRate { salary, comment }| (salary, comment))
                        .unzip();

                    (
                        rates::participant_id.eq(participant_id),
                        rates::jury_id.eq(jury_id),
                        rates::salary.eq(salary),
                        rates::comment.eq(comment),
                    )
                })
                .collect::<Vec<_>>();

            diesel::insert_into(rates::table)
                .values(records)
                .execute(conn)?;

            Ok((ParticipantId(participant_id), participant_code))
        })
        .await
    }

    pub async fn get(&self, id: ParticipantId) -> Result<Option<Participant>> {
        self.transact(move |conn| {
            use schema::{adults, participant_rates as rates, participants};

            let participant: Option<models::Participant> = participants::table
                .select(models::Participant::as_select())
                .filter({
                    let id = participants::id.eq(id.0);
                    let not_deleted = participants::deleted_by.is_null();
                    id.and(not_deleted)
                })
                .first(conn)
                .optional()?;

            let Some(participant) = participant else {
                return Ok(None);
            };

            let Ok(answers) = serde_json::from_value(participant.answers) else {
                return Err(DataSourceError::DbError(DieselError::DeserializationError(
                    format!("invalid answers at participant id {}", participant.id).into(),
                )));
            };

            let jury: Option<Adult> = if let Some(jury_id) = participant.jury_id {
                adults::table
                    .select(super::models::Adult::as_select())
                    .filter(adults::id.eq(jury_id))
                    .first(conn)
                    .optional()?
                    .map(TryInto::try_into)
                    .transpose()?
            } else {
                None
            };

            let rates = {
                let rates: Vec<models::ParticipantRate> = rates::table
                    .select(models::ParticipantRate::as_select())
                    .filter(rates::participant_id.eq(id.0))
                    .load(conn)?;

                Self::group_rates(rates).remove(&id).unwrap_or_default()
            };

            Ok(Some(Participant {
                id: ParticipantId(participant.id),
                code: participant.code,
                jury,
                info: ParticipantInfo {
                    name: participant.name,
                    photo_url: participant.photo_url,
                    city: participant.city,
                    district: participant.district,
                    edu_org: participant.edu_org,
                    phone_number: participant.phone_number,
                    email: participant.email,
                    responsible_adult_name: participant.responsible_adult_name,
                    responsible_adult_phone_number: participant.responsible_adult_phone_number,
                },
                answers: Self::sanitize_answers(answers),
                rates,
            }))
        })
        .await
    }

    pub async fn get_all(&self, sort: Sort) -> Result<Vec<Participant>> {
        self.transact(move |conn| {
            use schema::{adults, participant_rates as rates, participants};

            let adults: HashMap<AdultId, Adult> = adults::table
                .select(super::models::Adult::as_select())
                .load(conn)?
                .into_iter()
                .map(|adult| Adult::try_from(adult).map(|adult| (adult.id, adult)))
                .collect::<diesel::QueryResult<_>>()?;

            let mut rates = {
                let rates: Vec<models::ParticipantRate> = rates::table
                    .select(models::ParticipantRate::as_select())
                    .load(conn)?;

                Self::group_rates(rates)
            };

            let query = participants::table
                .select(models::Participant::as_select())
                .filter(participants::deleted_by.is_null());

            let participants: Vec<models::Participant> = match sort {
                Sort::Asc => query.order_by(participants::id.asc()).load(conn)?,
                Sort::Desc => query.order_by(participants::id.desc()).load(conn)?,
            };

            participants
                .into_iter()
                .map(|participant| {
                    Ok(Participant {
                        id: ParticipantId(participant.id),
                        code: participant.code,
                        jury: participant
                            .jury_id
                            .map(|jury_id| adults.get(&AdultId(jury_id)).cloned().unwrap()),
                        info: ParticipantInfo {
                            name: participant.name,
                            photo_url: participant.photo_url,
                            city: participant.city,
                            district: participant.district,
                            edu_org: participant.edu_org,
                            phone_number: participant.phone_number,
                            email: participant.email,
                            responsible_adult_name: participant.responsible_adult_name,
                            responsible_adult_phone_number: participant
                                .responsible_adult_phone_number,
                        },
                        answers: Self::sanitize_answers(
                            serde_json::from_value(participant.answers).map_err(|_| {
                                DataSourceError::DbError(DieselError::DeserializationError(
                                    format!("invalid answers at participant id {}", participant.id)
                                        .into(),
                                ))
                            })?,
                        ),
                        rates: rates
                            .remove(&ParticipantId(participant.id))
                            .unwrap_or_default(),
                    })
                })
                .collect()
        })
        .await
    }

    fn group_rates(
        rates: Vec<models::ParticipantRate>,
    ) -> HashMap<ParticipantId, HashMap<AdultId, Option<ParticipantRate>>> {
        let mut output: HashMap<ParticipantId, HashMap<AdultId, Option<ParticipantRate>>> =
            HashMap::default();

        for rate in rates {
            output
                .entry(ParticipantId(rate.participant_id))
                .or_default()
                .insert(
                    AdultId(rate.jury_id),
                    rate.salary
                        .zip(rate.comment)
                        .map(|(salary, comment)| ParticipantRate { salary, comment }),
                );
        }

        output
    }

    fn sanitize_answers(mut answers: HashMap<String, String>) -> HashMap<String, String> {
        for answer in answers.values_mut() {
            *answer = answer.trim().to_owned();
        }

        answers
    }

    pub async fn set_info(&self, id: ParticipantId, info: ParticipantInfo) -> Result<()> {
        self.transact(move |conn| {
            use schema::participants;

            let participant_exists = Self::participant_exists(conn, id)?;
            if !participant_exists {
                return Err(DataSourceError::UnknownParticipant(id));
            }

            diesel::update(participants::table)
                .filter(participants::id.eq(id.0))
                .set(models::ParticipantInfo::from(info))
                .execute(conn)?;

            Ok(())
        })
        .await
    }

    pub async fn set_jury(&self, id: ParticipantId, jury_id: Option<AdultId>) -> Result<()> {
        self.transact(move |conn| {
            use schema::participants;

            let participant_exists = Self::participant_exists(conn, id)?;
            if !participant_exists {
                return Err(DataSourceError::UnknownParticipant(id));
            }

            if let Some(jury_id) = jury_id {
                let jury_exists = Self::adult_exists(conn, jury_id, AdultRole::Jury)?;
                if !jury_exists {
                    return Err(DataSourceError::UnknownAdult(jury_id));
                }
            }

            diesel::update(participants::table)
                .filter(participants::id.eq(id.0))
                .set(participants::jury_id.eq(jury_id.map(|id| id.0)))
                .execute(conn)?;

            Ok(())
        })
        .await
    }

    pub async fn set_jury_rate(
        &self,
        id: ParticipantId,
        jury_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<()> {
        self.transact(move |conn| {
            use schema::participant_rates as rates;

            let participant_exists = Self::participant_exists(conn, id)?;
            if !participant_exists {
                return Err(DataSourceError::UnknownParticipant(id));
            }

            let jury_exists = Self::adult_exists(conn, jury_id, AdultRole::Jury)?;
            if !jury_exists {
                return Err(DataSourceError::UnknownAdult(jury_id));
            }

            let (salary, comment) = rate.map(|rate| (rate.salary, rate.comment)).unzip();

            diesel::update(rates::table)
                .filter({
                    let participant_id = rates::participant_id.eq(id.0);
                    let jury_id = rates::jury_id.eq(jury_id.0);
                    participant_id.and(jury_id)
                })
                .set((rates::salary.eq(salary), rates::comment.eq(comment)))
                .execute(conn)?;

            Ok(())
        })
        .await
    }

    pub async fn delete(&self, id: ParticipantId, adult_id: AdultId) -> Result<()> {
        self.transact(move |conn| {
            use schema::participants;

            let participant_exists = Self::participant_exists(conn, id)?;
            if !participant_exists {
                return Err(DataSourceError::UnknownParticipant(id));
            }

            let adult_exists = Self::adult_exists(conn, adult_id, AdultRole::Org)?;
            if !adult_exists {
                return Err(DataSourceError::UnknownAdult(adult_id));
            }

            diesel::update(participants::table)
                .filter(participants::id.eq(id.0))
                .set(participants::deleted_by.eq(adult_id.0))
                .execute(conn)?;

            Ok(())
        })
        .await
    }

    fn participant_exists(conn: &mut PgConnection, id: ParticipantId) -> Result<bool> {
        use diesel::dsl::{exists, select};
        use schema::participants::dsl;

        select(exists(
            dsl::participants.filter(dsl::id.eq(id.0).and(dsl::deleted_by.is_null())),
        ))
        .get_result::<bool>(conn)
        .map_err(Into::into)
    }

    fn adult_exists(conn: &mut PgConnection, id: AdultId, role: AdultRole) -> Result<bool> {
        use diesel::dsl::{exists, select};
        use schema::adults::dsl;

        select(exists(dsl::adults.filter({
            let id = dsl::id.eq(id.0);
            let jury = dsl::role.eq(role.to_string());
            id.and(jury)
        })))
        .get_result::<bool>(conn)
        .map_err(Into::into)
    }

    #[inline(always)]
    async fn transact<F, R>(&self, f: F) -> Result<R>
    where
        F: FnOnce(&mut PgConnection) -> Result<R> + Send + 'static,
        R: Send + 'static,
    {
        let conn = self.conn.clone();

        tokio::task::spawn_blocking(move || {
            let mut conn = conn.lock().expect("connection shouldn't be poisoned");
            conn.transaction(move |conn| f(conn))
        })
        .await
        .expect("database queries shouldn't panic")
    }
}
