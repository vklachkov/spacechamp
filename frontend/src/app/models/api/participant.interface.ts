import { Adult } from './adult.interface';

export interface Participant {
  id: number;
  code: string,
  jury: Adult | null,
  has_call: boolean,
  deleted_by: Adult | null,
  info: ParticipantInfo;
  answers: QA;
  rates: Rates;
}

export type QA = Record<string, string>;

export type Rates = Record<number, JuryRate | null>;

export interface ParticipantInfo {
  name: string;
  photo_url: string;
  city: string;
  district: string;
  edu_org: string;
  phone_number: string;
  email: string;
  responsible_adult_name: string,
  responsible_adult_phone_number: string,
}

export interface JuryRate {
  salary: number;
  comment: string;
}
