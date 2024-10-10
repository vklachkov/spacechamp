import { Answers, JuryRate, ParticipantInfo } from './participant.interface';

// Обезличенный участник (для оценки жюри)
export interface AnonymousParticipant {
  // Идентификатор
  id: number;
  // Находится ли в команде
  in_command: boolean;
  // Информация об участнике.
  // Доступно только если человек находится в команде.
  info: ParticipantInfo | null,
  // Ответы
  answers: Answers;
  // Оценка
  rate: JuryRate | null;
}
