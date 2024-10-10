mod jury;
mod login;
mod org;
mod report;
mod tilda;

use super::{auth, BackendState, BackendTokens, Services};
use crate::{datasource::DataSource, domain::*};
use axum::{
    routing::{delete, get, post},
    Router,
};
use std::sync::Arc;

pub fn router(
    datasource: Arc<DataSource>,
    services: Arc<Services>,
    tokens: Arc<BackendTokens>,
) -> Router {
    let state = BackendState {
        datasource,
        services,
        tokens,
    };

    Router::new()
        .route("/login", post(login::login))
        .route("/logout", post(login::logout))
        .route("/webhook/new_application", post(tilda::new_application))
        .nest("/org", orgs_methods())
        .nest("/jury", juries_methods())
        .with_state(Arc::new(state))
}

fn orgs_methods() -> Router<Arc<BackendState>> {
    Router::new()
        .route("/participants", get(org::all_participants))
        .route("/participants/report", get(report::build_report))
        .route("/participant", post(org::create_participant))
        .route(
            "/participant/:id",
            get(org::get_participant)
                .delete(org::delete_participant)
                .patch(org::patch_participant),
        )
        .route("/participant/:id/command", post(org::set_command))
        .route("/adults", get(org::all_adults))
        .route("/adult", post(org::create_adult))
        .route("/adult/:id", delete(org::delete_adult))
        .route_layer(axum_login::permission_required!(
            auth::Backend,
            AdultRole::Org,
        ))
}

fn juries_methods() -> Router<Arc<BackendState>> {
    Router::new()
        .route("/participants", get(jury::all_participants))
        .route("/participant/:id", get(jury::get_participant))
        .route("/participant/:id/rate", post(jury::set_rate))
        .route_layer(axum_login::permission_required!(
            auth::Backend,
            AdultRole::Jury,
        ))
}
