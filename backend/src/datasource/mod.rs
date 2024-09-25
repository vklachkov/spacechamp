mod adults;
mod models;
mod participants;
mod result;
mod schema;

pub use self::result::DataSourceError;

use self::{adults::Adults, participants::Participants};
use crate::domain::*;
use diesel::{Connection, PgConnection};
use diesel_migrations::{embed_migrations, EmbeddedMigrations, MigrationHarness};
use std::sync::{Arc, Mutex};

pub const MIGRATIONS: EmbeddedMigrations = embed_migrations!("migrations");
pub struct DataSource {
    pub participants: Participants,
    pub adults: Adults,
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
}
