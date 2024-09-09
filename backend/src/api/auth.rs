use crate::{data::DataSourceError, domain::*};
use axum::async_trait;
use axum_login::{AuthUser, AuthnBackend, UserId};
use serde::Deserialize;

#[derive(Clone, Debug, Deserialize)]
#[repr(transparent)]
#[serde(transparent)]
pub struct User(pub Adult);

impl AuthUser for User {
    type Id = AdultId;

    fn id(&self) -> Self::Id {
        self.0.id
    }

    fn session_auth_hash(&self) -> &[u8] {
        self.0.password.as_bytes()
    }
}

#[derive(Debug, Clone, Deserialize)]
pub struct Credentials {
    pub name: String,
    pub password: String,
}

#[derive(Clone, Copy)]
pub struct Backend {}

impl Backend {
    pub fn new() -> Self {
        Self {}
    }
}

#[async_trait]
impl AuthnBackend for Backend {
    type User = User;
    type Credentials = Credentials;
    type Error = DataSourceError;

    async fn authenticate(
        &self,
        creds: Self::Credentials,
    ) -> Result<Option<Self::User>, Self::Error> {
        if creds.name == "Ян Трояновский" && creds.password == "12345678" {
            Ok(Some(User(Adult {
                id: AdultId(100),
                name: "Ян Трояновский".to_owned(),
                password: "12345678".to_owned(),
                role: AdultRole::Jury,
            })))
        } else if creds.name == "Илья Овчинников" && creds.password == "87654321" {
            Ok(Some(User(Adult {
                id: AdultId(101),
                name: "Илья Овчинников".to_owned(),
                password: "87654321".to_owned(),
                role: AdultRole::Jury,
            })))
        } else {
            Ok(None)
        }
    }

    async fn get_user(&self, user_id: &UserId<Self>) -> Result<Option<Self::User>, Self::Error> {
        if *user_id == AdultId(100) {
            Ok(Some(User(Adult {
                id: AdultId(100),
                name: "Ян Трояновский".to_owned(),
                password: "12345678".to_owned(),
                role: AdultRole::Jury,
            })))
        } else if *user_id == AdultId(101) {
            Ok(Some(User(Adult {
                id: AdultId(101),
                name: "Илья Овчинников".to_owned(),
                password: "87654321".to_owned(),
                role: AdultRole::Jury,
            })))
        } else {
            Ok(None)
        }
    }
}

pub type AuthSession = axum_login::AuthSession<Backend>;
