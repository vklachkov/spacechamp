FROM rust:latest AS builder
WORKDIR /app
COPY Cargo.toml /app/
COPY . /app
RUN cargo build --release

FROM debian:bookworm-slim
COPY --from=builder /app/target/release/backend /bin
ENTRYPOINT [ "/bin/backend", "--addr", "0.0.0.0:80", "--sessions-path", "/var/lib/backend/sessions.json" ]