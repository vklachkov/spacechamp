import { Answers, JuryRate } from './participant.interface';

// Обезличенный участник (для оценки жюри)
export interface AnonymousParticipant {
  // Идентификатор
  id: number;
  // Шифр
  code: string,
  // Находится ли в команде
  in_command: boolean;
  // Ответы
  answers: Answers;
  // Оценка
  rate: JuryRate | null;
}
