import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant } from '../models/api/participant.interface';
import { Adult } from '../models/api/adult.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizerService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>('/api/v1/org/participants');
  }

  getParticipantById(id: number): Observable<Participant | null> {
    return this.http.get<Participant | null>(`/api/v1/org/participant/${id}`);
  }

  setParticipantCommand(participantId: number, juryId: number | null): Observable<void> {
    return this.http.post<void>(`/api/v1/org/participant/${participantId}/command`, {
      jury_id: juryId
    });
  }

  getAdults(): Observable<Adult[]> {
    return this.http.get<Adult[]>('/api/v1/org/adults');
  }

  createAdult(data: Omit<Adult, 'id'>): Observable<void> {
    return this.http.post<void>('/api/v1/org/adult', data);
  }

  deleteAdult(id: number): Observable<void> {
    return this.http.delete<void>(`/api/v1/org/adult/${id}`);
  }
}
