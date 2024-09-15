use crate::domain;
use diesel::{prelude::*, result::Error as DieselError};
use std::str::FromStr;

#[derive(Insertable, AsChangeset)]
#[diesel(table_name = super::schema::adults)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewAdult {
    pub name: String,
    pub password: String,
    pub role: String,
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = super::schema::adults)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Adult {
    pub id: i32,
    pub name: String,
    pub password: String,
    pub role: String,
}

impl TryFrom<Adult> for domain::Adult {
    type Error = DieselError;

    fn try_from(
        Adult {
            id,
            name,
            password,
            role,
        }: Adult,
    ) -> Result<domain::Adult, Self::Error> {
        Ok(Self {
            role: super::AdultRole::from_str(&role).map_err(|_| {
                DieselError::DeserializationError(
                    format!("invalid adult {name} (id {id}) role {role}").into(),
                )
            })?,
            password,
            name,
            id: domain::AdultId(id as usize),
        })
    }
}
