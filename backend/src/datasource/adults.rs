use super::{result::Result, schema};
use crate::domain::*;
use diesel::{
    BoolExpressionMethods, ExpressionMethods, OptionalExtension, PgConnection, QueryDsl,
    RunQueryDsl, SelectableHelper,
};
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
        self.execute(move |conn| {
            use schema::adults;

            diesel::insert_into(adults::table)
                .values(super::models::NewAdult {
                    name,
                    password,
                    role: role.to_string(),
                })
                .execute(conn)
                .map(|_| ())
        })
        .await
    }

    pub async fn get(&self, id: AdultId) -> Result<Option<Adult>> {
        self.execute(move |conn| {
            use schema::adults;

            adults::table
                .select(super::models::Adult::as_select())
                .filter(adults::id.eq(id.0 as i32))
                .first(conn)
                .optional()?
                .map(TryInto::try_into)
                .transpose()
        })
        .await
    }

    pub async fn get_all(&self) -> Result<Vec<Adult>> {
        self.execute(move |conn| {
            use schema::adults;

            adults::table
                .select(super::models::Adult::as_select())
                .load(conn)?
                .into_iter()
                .map(TryInto::try_into)
                .collect()
        })
        .await
    }

    pub async fn find(&self, name: String, password: String) -> Result<Option<Adult>> {
        self.execute(move |conn| {
            use schema::adults;

            adults::table
                .select(super::models::Adult::as_select())
                .filter(adults::name.eq(name).and(adults::password.eq(password)))
                .first(conn)
                .optional()?
                .map(TryInto::try_into)
                .transpose()
        })
        .await
    }

    pub async fn role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        self.execute(move |conn| {
            use schema::adults;

            let role: Option<String> = adults::table
                .select(adults::role)
                .filter(adults::id.eq(id.0 as i32))
                .first::<String>(conn)
                .optional()?;

            let Some(raw_role) = role else {
                return Ok(None);
            };

            match AdultRole::from_str(&raw_role) {
                Ok(role) => Ok(Some(role)),
                Err(_) => Err(diesel::result::Error::DeserializationError(
                    format!("invalid role '{raw_role}' from adult {id}").into(),
                )),
            }
        })
        .await
    }

    pub async fn delete(&self, id: AdultId) -> Result<()> {
        self.execute(move |conn| {
            use schema::adults;

            diesel::delete(adults::table)
                .filter(adults::id.eq(id.0 as i32))
                .execute(conn)
                .map(|_| ())
        })
        .await
    }

    #[inline(always)]
    async fn execute<F, R>(&self, f: F) -> Result<R>
    where
        F: FnOnce(&mut PgConnection) -> diesel::QueryResult<R> + Send + 'static,
        R: Send + 'static,
    {
        let conn = self.conn.clone();

        tokio::task::spawn_blocking(move || {
            let mut conn = conn.lock().expect("connection shouldn't be poisoned");
            f(&mut conn)
        })
        .await
        .expect("database queries shouldn't panic")
        .map_err(Into::into)
    }
}
