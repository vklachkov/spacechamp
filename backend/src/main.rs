mod api;
mod data;
mod domain;

use argh::FromArgs;
use axum::Router;
use axum_login::{tower_sessions::SessionManagerLayer, AuthManagerLayerBuilder};
use data::DataSource;
use std::{net::SocketAddr, path::PathBuf, sync::Arc};
use tokio::signal;
use tower_http::cors::CorsLayer;

#[derive(FromArgs)]
/// Backend of Space Championship Admin Panel
struct Args {
    #[argh(option)]
    /// bind address
    addr: SocketAddr,

    #[argh(option)]
    /// path to sessions store
    sessions_path: PathBuf,

    /// enable extra logs
    #[argh(switch)]
    verbose: bool,

    /// enable trace logs
    #[argh(switch)]
    trace: bool,
}

#[tokio::main]
async fn main() {
    let args: Args = argh::from_env();

    setup_log(&args);
    hello(&args);

    run(args.addr, args.sessions_path).await;
}

fn setup_log(args: &Args) {
    let collector = tracing_subscriber::fmt()
        .with_max_level(if args.trace {
            tracing::Level::TRACE
        } else if args.verbose {
            tracing::Level::DEBUG
        } else {
            tracing::Level::INFO
        })
        .finish();

    tracing::subscriber::set_global_default(collector).unwrap();
}

fn hello(args: &Args) {
    tracing::info!(
        "{bin} version {version}, address {address}, sessions path {sessions_path}, {verbose}",
        bin = env!("CARGO_PKG_NAME"),
        version = env!("CARGO_PKG_VERSION"),
        address = args.addr,
        sessions_path = args.sessions_path.display(),
        verbose = if args.trace {
            "trace enabled"
        } else if args.verbose {
            "verbose enabled"
        } else {
            "additional logs disabled"
        },
    );
}

async fn run(addr: SocketAddr, sessions_path: PathBuf) {
    let datasource = Arc::new(DataSource::new());

    let session_store = api::session_store::JsonSessionStore::new(sessions_path).await;
    let session_layer = SessionManagerLayer::new(session_store).with_secure(false);

    let auth_backend = api::auth::Backend::new(datasource.clone());
    let auth_layer = AuthManagerLayerBuilder::new(auth_backend, session_layer).build();

    let cors_layer = CorsLayer::very_permissive();

    let app = Router::new()
        .nest("/api/v1", api::v1(datasource))
        .layer(auth_layer)
        .layer(cors_layer);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown())
        .await
        .unwrap();
}

async fn shutdown() {
    let ctrl_c = async {
        signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        signal::unix::signal(signal::unix::SignalKind::terminate())
            .expect("failed to install signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    };

    tracing::info!("Shutdown server...");
}
