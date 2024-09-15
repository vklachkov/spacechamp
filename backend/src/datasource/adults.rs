use super::{
    result::{DataSourceError, Result},
    schema,
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
        self.transact(move |conn| {
            use diesel::dsl::{exists, select};
            use schema::{
                adults::{self, dsl},
                participant_rates as rates, participants,
            };

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
        self.transact(move |conn| {
            use schema::adults;

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
        self.transact(move |conn| {
            use schema::adults;

            adults::table
                .select(super::models::Adult::as_select())
                .load(conn)?
                .into_iter()
                .map(TryInto::try_into)
                .collect::<diesel::QueryResult<_>>()
                .map_err(Into::into)
        })
        .await
    }

    pub async fn find(&self, name: String, password: String) -> Result<Option<Adult>> {
        self.transact(move |conn| {
            use schema::adults;

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
        self.transact(move |conn| {
            use schema::adults;

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
        self.transact(move |conn| {
            use diesel::dsl::{exists, select};
            use schema::adults::{self, dsl};

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
