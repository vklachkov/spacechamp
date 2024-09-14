use crate::datasource::DataSourceError;
use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

pub type Result<T, E = ApiError> = ::core::result::Result<T, E>;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("{0}")]
    InvalidParameter(String),

    #[error("data error: {0}")]
    DataSource(#[from] DataSourceError),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::InvalidParameter(err) => {
                (StatusCode::BAD_REQUEST, err.to_string()).into_response()
            }
            Self::DataSource(err) => {
                // TODO: check error type
                (StatusCode::BAD_REQUEST, err.to_string()).into_response()
            }
        }
    }
}
