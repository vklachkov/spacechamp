import { QA, ParticipantInfo } from './participant.interface';

export interface ParticipantUpdateInfo extends ParticipantInfo {
  answers: QA;
}
