import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnonymousParticipant } from '../models/api/anonymous-participant.interface';
import { JuryRate } from '../models/api/participant.interface';

@Injectable({
  providedIn: 'root',
})
export class JuryService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(): Observable<AnonymousParticipant[]> {
    return this.http.get<AnonymousParticipant[]>('/api/v1/jury/participants');
  }

  getParticipantById(id: number): Observable<AnonymousParticipant | null> {
    return this.http.get<AnonymousParticipant | null>(`/api/v1/jury/participant/${id}`);
  }

  rateParticipant(participantId: number, rate: JuryRate): Observable<void> {
    return this.http.post<void>(`/api/v1/jury/participant/${participantId}/rate`, rate);
  }
}
