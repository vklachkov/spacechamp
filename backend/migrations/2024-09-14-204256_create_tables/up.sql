CREATE TABLE adults (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    password VARCHAR NOT NULL,
    role VARCHAR NOT NULL
);

CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    code VARCHAR NOT NULL,
    name VARCHAR NOT NULL,
    photo_url VARCHAR NOT NULL,
    city VARCHAR NOT NULL,
    district VARCHAR NOT NULL,
    edu_org VARCHAR NOT NULL,
    phone_number VARCHAR NOT NULL,
    email VARCHAR NOT NULL,
    responsible_adult_name VARCHAR NOT NULL,
    responsible_adult_phone_number VARCHAR NOT NULL,

    answers JSONB NOT NULL,

    jury_id INTEGER,
    FOREIGN KEY (jury_id) REFERENCES Adults (id) ON DELETE SET NULL
);

CREATE TABLE participant_rates (
    id SERIAL PRIMARY KEY,

    jury_id INTEGER NOT NULL,
    FOREIGN KEY (jury_id) REFERENCES Adults (id) ON DELETE CASCADE,

    participant_id INTEGER NOT NULL,
    FOREIGN KEY (participant_id) REFERENCES Participants (id) ON DELETE RESTRICT,

    salary INTEGER NOT NULL,
    comment VARCHAR NOT NULL
);