import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant } from '../models/api/participant.interface';
import { ParticipantCommandInput } from '../models/api/participant-command-input.interface';
import { Adult } from '../models/api/adult.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizerService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(): Observable<Participant[]> {
    return this.http.get<Participant[]>('/api/v1/org/participants');
  }

  setParticipantCommand(data: ParticipantCommandInput): Observable<void> {
    return this.http.post<void>('/api/v1/org/participant/command', data);
  }

  getAdults(): Observable<Adult[]> {
    return this.http.get<Adult[]>('/api/v1/org/adults');
  }

  deleteJury(id: number): Observable<void> {
    return this.http.delete<void>('/api/v1/org/adult', {
      body: {
        id,
      },
    });
  }
}
