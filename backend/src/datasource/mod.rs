mod adults;
mod models;
mod participants;
mod result;
mod schema;

pub use self::result::DataSourceError;

use self::{adults::Adults, participants::Participants, result::Result};
use crate::domain::*;
use diesel::{Connection, PgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::{
    collections::HashMap,
    sync::{Arc, Mutex},
};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");

pub struct DataSource {
    participants: Participants,
    adults: Adults,
}

impl DataSource {
    pub fn new(db_url: &str) -> Self {
        let conn = {
            let conn = Self::connect_to_db(db_url);
            Arc::new(Mutex::new(conn))
        };

        Self {
            participants: Participants::new(conn.clone()),
            adults: Adults::new(conn),
        }
    }

    fn connect_to_db(db_url: &str) -> PgConnection {
        tracing::info!("Connecting to {db_url}...");

        let mut connection = PgConnection::establish(db_url)
            .unwrap_or_else(|err| panic!("Failed to connect to PG (db url is {db_url}): {err}"));

        tracing::info!("Running migrations on DB...");

        connection
            .run_pending_migrations(MIGRATIONS)
            .unwrap_or_else(|err| panic!("Postgres migrations error: {err}"));

        tracing::info!("Postgres is ready!");

        connection
    }

    pub async fn create_participant(
        &self,
        code: Option<String>,
        jury: Option<Adult>,
        info: ParticipantInfo,
        answers: HashMap<String, String>,
        rates: Option<HashMap<AdultId, Option<ParticipantRate>>>
    ) -> Result<(ParticipantId, String)> {
        self.participants.create(code, jury, info, answers, rates).await
    }

    pub async fn get_participant(&self, id: ParticipantId) -> Result<Option<Participant>> {
        self.participants.get(id).await
    }

    pub async fn get_all_participants(&self, sort: Sort) -> Result<Vec<Participant>> {
        self.participants.get_all(sort).await
    }

    pub async fn update_participant_info(
        &self,
        id: ParticipantId,
        info: ParticipantInfo,
    ) -> Result<()> {
        self.participants.set_info(id, info).await
    }

    pub async fn set_participant_command(
        &self,
        id: ParticipantId,
        adult_id: Option<AdultId>,
    ) -> Result<()> {
        self.participants.set_jury(id, adult_id).await
    }

    pub async fn set_participant_rate(
        &self,
        id: ParticipantId,
        adult_id: AdultId,
        rate: Option<ParticipantRate>,
    ) -> Result<()> {
        self.participants.set_jury_rate(id, adult_id, rate).await
    }

    pub async fn delete_participant(&self, id: ParticipantId, adult_id: AdultId) -> Result<()> {
        self.participants.delete(id, adult_id).await
    }

    pub async fn get_adult(&self, id: AdultId) -> Result<Option<Adult>> {
        self.adults.get(id).await
    }

    pub async fn get_all_adults(&self) -> Result<Vec<Adult>> {
        self.adults.get_all().await
    }

    pub async fn find_adult(&self, name: String, password: String) -> Result<Option<Adult>> {
        self.adults.find(name, password).await
    }

    pub async fn get_adult_role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        self.adults.role(id).await
    }

    pub async fn new_adult(&self, name: String, password: String, role: AdultRole) -> Result<()> {
        self.adults.create(name, password, role).await
    }

    pub async fn delete_adult(&self, id: AdultId) -> Result<()> {
        self.adults.delete(id).await
    }
}
