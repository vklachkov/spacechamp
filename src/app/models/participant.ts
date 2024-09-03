// Участник
export interface Participant {
    id: number,
    // TODO: А оно точно не обязательное?
    info?: ParticipantInfo,
    answers: Record<string, string>,
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

// Оценка члена жюри.
export interface JuriScore {
    salary: number;
    comment: string;
}