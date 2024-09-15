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
        unimplemented!()
    }

    pub async fn get(&self, id: AdultId) -> Result<Option<Adult>> {
        unimplemented!()
    }

    pub async fn get_all(&self) -> Result<Vec<Adult>> {
        unimplemented!()
    }

    pub async fn find(&self, name: &str, password: &str) -> Result<Option<Adult>> {
        unimplemented!()
    }

    pub async fn role(&self, id: AdultId) -> Result<Option<AdultRole>> {
        unimplemented!()
    }

    pub async fn delete(&self, id: AdultId) -> Result<()> {
        unimplemented!()
    }
}
