use super::result::{DataSourceError, Result};
use crate::domain::*;
use std::collections::HashMap;
use tokio::{sync::Mutex, time::Instant};

pub(crate) struct Adults {
    cache: Mutex<HashMap<AdultId, Adult>>,
}

impl Adults {
    pub fn new() -> Self {
        Self {
            cache: Mutex::new(Default::default()),
        }
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
