use super::{
    result::{DataSourceError, Result},
    schema::{adults, participant_rates as rates, participants},
    utils::transact,
};
use crate::domain::*;
use diesel::prelude::*;
use std::{
    str::FromStr,
    sync::{Arc, Mutex},
};
pub(crate) struct Adults {
    conn: Arc<Mutex<PgConnection>>,
}

impl Adults {
    pub fn new(conn: Arc<Mutex<PgConnection>>) -> Self {
        Self { conn }
    }

    pub async fn create(&self, name: String, password: String, role: AdultRole) -> Result<()> {
        transact(self.conn.clone(), move |conn| {
            use adults::dsl;
            use diesel::dsl::{exists, select};

            let exists =
                select(exists(dsl::adults.filter(dsl::name.eq(&name)))).get_result::<bool>(conn)?;
            if exists {
                return Err(DataSourceError::AdultAlreadyExists(name));
            }

            let adult_id: i32 = diesel::insert_into(adults::table)
                .values(super::models::NewAdult {
                    name,
                    password,
                    role: role.to_string(),
                })
                .returning(adults::id)
                .get_result(conn)?;

            if role == AdultRole::Jury {
                // TODO: Combine select and insert.
                let participant_ids: Vec<i32> =
                    participants::table.select(participants::id).load(conn)?;

                let records = participant_ids
                    .into_iter()
                    .map(|participant_id| {
                        (
                            rates::participant_id.eq(participant_id),
                            rates::jury_id.eq(adult_id),
                        )
                    })
                    .collect::<Vec<_>>();

                diesel::insert_into(rates::table)
                    .values(records)
                    .execute(conn)?;
            }

            Ok(())
        })
        .await
    }

    pub async fn get(&self, id: AdultId) -> Result<Option<Adult>> {
        transact(self.conn.clone(), move |conn| {
            adults::table
                .select(super::models::Adult::as_select())
                .filter(adults::id.eq(id.0))
                .first(conn)
                .optional()?
                .map(TryInto::try_into)
                .transpose()
                .map_err(Into::into)
        })
        .await
    }

    pub async fn get_all(&self) -> Result<Vec<Adult>> {
        transact(self.conn.clone(), move |conn| {
            adults::table
                .select(super::models::Adult::as_select())
                .order_by(adults::id.asc())
                .load(conn)?
                .into_iter()
                .map(TryInto::try_into)
                .collect::<diesel::QueryResult<_>>()
                .map_err(Into::into)
        })
        .await
    }

    pub async fn find(&self, name: String, password: String) -> Result<Option<Adult>> {
        transact(self.conn.clone(), move |conn| {
            adults::table
                .select(super::models::Adult::as_select())
                .filter(adults::name.eq(name).and(adults::password.eq(password)))
                .first(conn)
                .optional()?
                .map(TryInto::try_into)
                .transpose()
                .map_err(Into::into)
        })
        .await
    }

    pub async fn role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        transact(self.conn.clone(), move |conn| {
            let role: Option<String> = adults::table
                .select(adults::role)
                .filter(adults::id.eq(id.0))
                .first::<String>(conn)
                .optional()?;

            let Some(raw_role) = role else {
                return Ok(None);
            };

            match AdultRole::from_str(&raw_role) {
                Ok(role) => Ok(Some(role)),
                Err(_) => Err(DataSourceError::DbError(
                    diesel::result::Error::DeserializationError(
                        format!("invalid role '{raw_role}' at adult id {id}").into(),
                    ),
                )),
            }
        })
        .await
    }

    pub async fn delete(&self, id: AdultId) -> Result<()> {
        transact(self.conn.clone(), move |conn| {
            use adults::dsl;
            use diesel::dsl::{exists, select};

            let exists: bool =
                select(exists(dsl::adults.filter(dsl::id.eq(id.0)))).get_result(conn)?;
            if !exists {
                return Err(DataSourceError::UnknownAdult(id));
            }

            diesel::delete(adults::table)
                .filter(adults::id.eq(id.0))
                .execute(conn)?;

            Ok(())
        })
        .await
    }
}
