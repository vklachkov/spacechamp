import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnonymousParticipant } from '../models/api/anonymous-participant.interface';
import { ParticipantRate } from '../models/api/participant-rate-input.interface';

@Injectable({
  providedIn: 'root',
})
export class JuryService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(): Observable<AnonymousParticipant[]> {
    return this.http.get<AnonymousParticipant[]>('/api/v1/jury/participants');
  }

  rateParticipant(data: ParticipantRate): Observable<void> {
    return this.http.post<void>('/api/v1/jury/participant/rate', data);
  }
}
