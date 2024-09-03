export interface Participant {
    id: number,
    info: ParticipantInfo | undefined,
    answers: ParticipantAnswers,
    scores: Record<number, JuriScore>,
}

// Базовая информация об участнике.
export interface ParticipantInfo {
    // ФИО.
    name: string,
    
    // Фотография.
    photoUrl: string,

    // Город, регион.
    location: string,

    // Номер телефона.
    phoneNumber: string,

    // Адрес электронной почты.
    email: string,

    // Образовательная организация.
    org: string,
}

// Развёрнутые ответы участника.
export interface ParticipantAnswers {
    // TODO
}

// Оценка члена жюри.
export interface JuriScore {
    rate: 0 | 1 | 2 | 3 | 4 | 5;
    comment: string;
}