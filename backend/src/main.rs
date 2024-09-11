mod api;
mod data;
mod domain;

use argh::FromArgs;
use axum::Router;
use axum_login::{
    tower_sessions::{MemoryStore, SessionManagerLayer},
    AuthManagerLayerBuilder,
};
use data::DataSource;
use std::{net::SocketAddr, sync::Arc};

#[derive(FromArgs)]
/// Backend of Space Championship Admin Panel
struct Args {
    #[argh(option)]
    /// bind address
    addr: SocketAddr,

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

    run(args.addr).await;
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
        "{bin} version {version}, address {address}, {verbose}",
        bin = env!("CARGO_PKG_NAME"),
        version = env!("CARGO_PKG_VERSION"),
        address = args.addr,
        verbose = if args.trace {
            "trace enabled"
        } else if args.verbose {
            "verbose enabled"
        } else {
            "additional logs disabled"
        },
    );
}

async fn run(addr: SocketAddr) {
    let datasource = Arc::new(DataSource::new());

    let session_store = MemoryStore::default();
    let session_layer = SessionManagerLayer::new(session_store).with_secure(false);

    let auth_backend = api::auth::Backend::new(datasource.clone());
    let auth_layer = AuthManagerLayerBuilder::new(auth_backend, session_layer).build();

    let app = Router::new()
        .nest("/api/v1", api::v1(datasource))
        .layer(auth_layer);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();

    axum::serve(listener, app).await.unwrap();
}
