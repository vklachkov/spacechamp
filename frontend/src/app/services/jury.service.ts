import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnonymousParticipant } from '../models/api/anonymous-participant.interface';
import { JuryRate } from '../models/api/participant.interface';
import { environment } from '../environments/environment.local';

@Injectable({
  providedIn: 'root',
})
export class JuryService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(): Observable<AnonymousParticipant[]> {
    return this.http.get<AnonymousParticipant[]>(`${environment.API_URL}/jury/participants`, { withCredentials: true });
  }

  getParticipantById(id: number): Observable<AnonymousParticipant | null> {
    return this.http.get<AnonymousParticipant | null>(`${environment.API_URL}/jury/participant/${id}`, { withCredentials: true });
  }

  rateParticipant(participantId: number, rate: JuryRate): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/jury/participant/${participantId}/rate`, rate, { withCredentials: true });
  }
}
