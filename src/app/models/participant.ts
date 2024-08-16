export interface Participant {
    id: number,
    info: ParticipantInfo,
    answers: ParticipantAnswers,
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