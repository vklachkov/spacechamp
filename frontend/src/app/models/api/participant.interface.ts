import { Adult } from './adult.interface';

// Участник
export interface Participant {
  // Идентификатор
  id: number;
  // Шифр
  code: string,
  // Жюри (если есть, значит он в команде)
  jury: Adult | null,
  // Вызов сделан?
  has_call: boolean,
  // Жюри, который удалил участника
  deleted_by: Adult | null,
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
  // ФИО
  name: string;
  // Ссылка на фотографию
  photo_url: string;
  // Город
  city: string;
  // Регион
  district: string;
  // Образовательная организация
  edu_org: string;
  // Номер телефона
  phone_number: string;
  // Адрес электронной почты
  email: string;
  // ФИО родителя / наставника
  responsible_adult_name: string,
  // Номер телефона родителя / наставника
  responsible_adult_phone_number: string,
}

// Оценка жюри
export interface JuryRate {
  // Зарплата
  salary: number;
  // Комментарий
  comment: string;
}
