use super::result::Result;
use diesel::{Connection, PgConnection};
use std::sync::{Arc, Mutex};

pub async fn transact<F, R>(conn: Arc<Mutex<PgConnection>>, f: F) -> Result<R>
where
    F: FnOnce(&mut PgConnection) -> Result<R> + Send + 'static,
    R: Send + 'static,
{
    tokio::task::spawn_blocking(move || {
        let mut conn = conn.lock().expect("connection shouldn't be poisoned");
        conn.transaction(move |conn| f(conn))
    })
    .await
    .expect("database queries shouldn't panic")
}
