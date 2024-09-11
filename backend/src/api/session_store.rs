use axum::async_trait;
use axum_login::tower_sessions::{
    cookie::time::OffsetDateTime,
    session::{Id, Record},
    session_store, SessionStore,
};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::Arc,
};
use tokio::{fs, sync::Mutex};

type MemoryStore = Arc<Mutex<HashMap<Id, Record>>>;

#[derive(Clone, Debug)]
pub struct JsonSessionStore {
    path: PathBuf,
    store: MemoryStore,
}

impl JsonSessionStore {
    pub async fn new(path: impl AsRef<Path>) -> Self {
        Self {
            path: path.as_ref().to_owned(),
            store: Self::load_sessions(path).await,
        }
    }

    async fn load_sessions(path: impl AsRef<Path>) -> MemoryStore {
        let Ok(sessions_content) = fs::read_to_string(path).await else {
            // TODO: log error
            return MemoryStore::default();
        };

        let Ok(sessions) = serde_json::from_str(&sessions_content) else {
            // TODO: log error
            return MemoryStore::default();
        };

        Arc::new(Mutex::new(sessions))
    }

    async fn dump(&self) -> session_store::Result<()> {
        let sessions_json = serde_json::to_vec(&*self.store.lock().await).unwrap();

        fs::write(&self.path, sessions_json)
            .await
            .map_err(|err| session_store::Error::Backend(err.to_string()))
    }
}

#[async_trait]
impl SessionStore for JsonSessionStore {
    async fn create(&self, record: &mut Record) -> session_store::Result<()> {
        {
            let mut store_guard = self.store.lock().await;

            // Session ID collision mitigation.
            while store_guard.contains_key(&record.id) {
                record.id = Id::default();
            }

            store_guard.insert(record.id, record.clone());
        }

        self.dump().await
    }

    async fn save(&self, record: &Record) -> session_store::Result<()> {
        {
            self.store.lock().await.insert(record.id, record.clone());
        }

        self.dump().await
    }

    async fn load(&self, session_id: &Id) -> session_store::Result<Option<Record>> {
        Ok(self
            .store
            .lock()
            .await
            .get(session_id)
            .filter(|Record { expiry_date, .. }| *expiry_date > OffsetDateTime::now_utc())
            .cloned())
    }

    async fn delete(&self, session_id: &Id) -> session_store::Result<()> {
        {
            self.store.lock().await.remove(session_id);
        }

        self.dump().await
    }
}
