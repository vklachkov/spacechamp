FROM rust:latest AS builder
WORKDIR /app
COPY Cargo.toml /app/
COPY . /app
RUN cargo build --release

FROM debian:bookworm-slim

RUN apt-get update && apt-get install -y ca-certificates libpq-dev

COPY --from=builder /app/target/release/backend /bin

ENTRYPOINT ["/bin/backend"]