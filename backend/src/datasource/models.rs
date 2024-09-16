use crate::domain;
use diesel::{prelude::*, result::Error as DieselError};
use rand::Rng;
use std::{collections::HashMap, str::FromStr};

#[derive(Insertable)]
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
            id: domain::AdultId(id),
        })
    }
}

#[derive(Insertable)]
#[diesel(table_name = super::schema::participants)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct NewParticipant {
    code: String,
    name: String,
    photo_url: String,
    city: String,
    district: String,
    edu_org: String,
    phone_number: String,
    email: String,
    responsible_adult_name: String,
    responsible_adult_phone_number: String,
    answers: serde_json::Value,
}

impl NewParticipant {
    pub fn new(info: domain::ParticipantInfo, answers: HashMap<String, String>) -> Self {
        let code = {
            let first_letter = info.name.chars().next().unwrap().to_uppercase();
            let last_letter = info.name.chars().last().unwrap().to_uppercase();
            let number = rand::thread_rng().gen_range(1000..9999);
            format!("{first_letter}{last_letter}-{number}")
        };

        Self {
            code,
            name: info.name,
            photo_url: info.photo_url,
            city: info.city,
            district: info.district,
            edu_org: info.edu_org,
            phone_number: info.phone_number,
            email: info.email,
            responsible_adult_name: info.responsible_adult_name,
            responsible_adult_phone_number: info.responsible_adult_phone_number,
            answers: serde_json::to_value(answers).unwrap(),
        }
    }
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = super::schema::participants)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct Participant {
    pub id: i32,
    pub code: String,
    pub name: String,
    pub photo_url: String,
    pub city: String,
    pub district: String,
    pub edu_org: String,
    pub phone_number: String,
    pub email: String,
    pub responsible_adult_name: String,
    pub responsible_adult_phone_number: String,
    pub jury_id: Option<i32>,
    pub answers: serde_json::Value,
}

#[derive(Insertable, AsChangeset)]
#[diesel(table_name = super::schema::participants)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ParticipantInfo {
    pub name: String,
    pub photo_url: String,
    pub city: String,
    pub district: String,
    pub edu_org: String,
    pub phone_number: String,
    pub email: String,
    pub responsible_adult_name: String,
    pub responsible_adult_phone_number: String,
}

impl From<domain::ParticipantInfo> for ParticipantInfo {
    fn from(info: domain::ParticipantInfo) -> Self {
        Self {
            name: info.name,
            photo_url: info.photo_url,
            city: info.city,
            district: info.district,
            edu_org: info.edu_org,
            phone_number: info.phone_number,
            email: info.email,
            responsible_adult_name: info.responsible_adult_name,
            responsible_adult_phone_number: info.responsible_adult_phone_number,
        }
    }
}

#[derive(Queryable, Selectable)]
#[diesel(table_name = super::schema::participant_rates)]
#[diesel(check_for_backend(diesel::pg::Pg))]
pub struct ParticipantRate {
    pub participant_id: i32,
    pub jury_id: i32,
    pub salary: Option<i32>,
    pub comment: Option<String>,
}
