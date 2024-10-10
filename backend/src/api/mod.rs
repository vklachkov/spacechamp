pub mod auth;
mod error;
mod payloads;
pub mod session_store;
pub mod v1;

use crate::DataSource;
use std::sync::Arc;
use url::Url;

struct BackendState {
    datasource: Arc<DataSource>,
    services: Arc<Services>,
    tokens: Arc<BackendTokens>,
}

pub struct Services {
    pub report_generator: Url,
}

pub struct BackendTokens {
    pub notisend: String,
}
