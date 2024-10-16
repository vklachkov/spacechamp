use serde::Serialize;

#[derive(Clone, Copy, Debug, Hash, PartialEq, Eq, PartialOrd, Ord, Serialize)]
#[rustfmt::skip]
pub enum Bureau {
    #[serde(rename = "1D")] OneD,
    #[serde(rename = "Салют")] Salut,
    #[serde(rename = "Звёздное")] Zvezdnoe,
    #[serde(rename = "Родное")] Rodnoe,
    #[serde(rename = "Око")] Oko,
}

impl Bureau {
    pub fn all() -> [Bureau; 5] {
        use Bureau::*;
        [OneD, Salut, Zvezdnoe, Rodnoe, Oko]
    }

    pub fn from_jury(name: &str) -> Option<Self> {
        match name {
            "Матюхин Андрей" => Some(Self::OneD),
            "Кириевский Дмитрий" => Some(Self::Salut),
            "Каменева Вероника" => Some(Self::Zvezdnoe),
            "Овчинников Илья" => Some(Self::Rodnoe),
            "Калинкин Александр" => Some(Self::Oko),
            _ => None,
        }
    }

    pub fn jury(self) -> &'static str {
        match self {
            Self::OneD => "Матюхин Андрей",
            Self::Salut => "Кириевский Дмитрий",
            Self::Zvezdnoe => "Каменева Вероника",
            Self::Rodnoe => "Овчинников Илья",
            Self::Oko => "Калинкин Александр",
        }
    }
}

#[derive(Clone, Debug, Serialize)]
pub struct BureauStats {
    pub participants: usize,
    pub max_participants: usize,
}

impl Default for BureauStats {
    fn default() -> Self {
        Self {
            participants: 0,
            max_participants: super::MAX_PARTICIPANTS_PER_BUREAU,
        }
    }
}
