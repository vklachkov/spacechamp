// @generated automatically by Diesel CLI.

diesel::table! {
    adults (id) {
        id -> Int4,
        name -> Varchar,
        password -> Varchar,
        role -> Varchar,
    }
}

diesel::table! {
    participant_rates (id) {
        id -> Int4,
        jury_id -> Int4,
        participant_id -> Int4,
        salary -> Int4,
        comment -> Varchar,
    }
}

diesel::table! {
    participants (id) {
        id -> Int4,
        code -> Varchar,
        name -> Varchar,
        photo_url -> Varchar,
        city -> Varchar,
        district -> Varchar,
        edu_org -> Varchar,
        phone_number -> Varchar,
        email -> Varchar,
        responsible_adult_name -> Varchar,
        responsible_adult_phone_number -> Varchar,
        answers -> Jsonb,
        jury_id -> Nullable<Int4>,
    }
}

diesel::joinable!(participant_rates -> adults (jury_id));
diesel::joinable!(participant_rates -> participants (participant_id));
diesel::joinable!(participants -> adults (jury_id));

diesel::allow_tables_to_appear_in_same_query!(
    adults,
    participant_rates,
    participants,
);
