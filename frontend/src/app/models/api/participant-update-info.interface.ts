import { Answers, ParticipantInfo } from './participant.interface';

export interface ParticipantUpdateInfo extends ParticipantInfo {
  answers: Answers;
}
