use crate::data::DataSourceError;
use axum::{http::StatusCode, response::IntoResponse};
use thiserror::Error;

pub type Result<T, E = ApiError> = ::core::result::Result<T, E>;

#[derive(Debug, Error)]
pub enum ApiError {
    #[error("datasource error: {0}")]
    DataSource(#[from] DataSourceError),

    #[error("internal error: {0}")]
    InternalError(Box<ApiError>),
}

impl IntoResponse for ApiError {
    fn into_response(self) -> axum::response::Response {
        match self {
            Self::DataSource(err) => {
                // TODO: check error type
                (StatusCode::BAD_REQUEST, err.to_string()).into_response()
            }
            Self::InternalError(err) => {
                tracing::error!("Internal server error: {err}");
                (StatusCode::INTERNAL_SERVER_ERROR, "Internal server error").into_response()
            }
        }
    }
}
