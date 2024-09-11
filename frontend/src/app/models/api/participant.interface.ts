// Участник
export interface Participant {
  // Идентификатор
  id: number;
  // Идентификатор жюри (если есть, значит он в команде)
  jury_id: number | null;
  // Базовая информация
  info: ParticipantInfo;
  // Ответы
  answers: Answers;
  // Оценки
  rates: Rates;
}

// Ответы на вопросы (ключ - вопрос, значение - ответ)
export type Answers = Record<string, string>;

// Оценки (ключ - идентификатор жюри, значение - оценка жюри)
export type Rates = Record<number, JuryRate | null>;

// Информация об участнике
export interface ParticipantInfo {
  // Имя
  name: string;
  // Фотография
  photoUrl: string;
  // Город
  city: string;
  // Район
  district: string;
  // Номер телефона
  phoneNumber: string;
  // Адрес электронной почты
  email: string;
  // Образовательная организация
  edu_org: string;
}

// Оценка жюри
export interface JuryRate {
  // Зарплата
  salary: number;
  // Комментарий
  comment: string;
}
