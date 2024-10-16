import { QA, JuryRate, ParticipantInfo } from './participant.interface';

export interface JuryParticipant {
  id: number;
  in_command: boolean;
  info: ParticipantInfo | null,  // Доступно только если человек находится в команде.
  answers: QA;
  rate: JuryRate | null;
}
