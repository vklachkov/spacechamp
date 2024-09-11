use crate::{
    data::{DataSource, DataSourceError},
    domain::*,
};
use axum::async_trait;
use axum_login::{AuthUser, AuthnBackend, AuthzBackend, UserId};
use serde::Deserialize;
use std::{collections::HashSet, sync::Arc};

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

#[derive(Clone)]
pub struct Backend {
    datasource: Arc<DataSource>,
}

impl Backend {
    pub fn new(datasource: Arc<DataSource>) -> Self {
        Self { datasource }
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
        self.datasource
            .find_adult(&creds.name, &creds.password)
            .await
            .map(|adult| adult.map(User))
    }

    async fn get_user(&self, user_id: &UserId<Self>) -> Result<Option<Self::User>, Self::Error> {
        self.datasource
            .adult(*user_id)
            .await
            .map(|adult| adult.map(User))
    }
}

#[async_trait]
impl AuthzBackend for Backend {
    type Permission = AdultRole;

    async fn get_group_permissions(
        &self,
        user: &Self::User,
    ) -> Result<HashSet<Self::Permission>, Self::Error> {
        let role = self.datasource.adult_role(user.id()).await?;
        if let Some(role) = role {
            Ok(HashSet::from([role]))
        } else {
            Err(DataSourceError::AdultId(user.id()))
        }
    }
}

pub type AuthSession = axum_login::AuthSession<Backend>;
