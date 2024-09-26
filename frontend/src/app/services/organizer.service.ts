import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant, ParticipantInfo } from '../models/api/participant.interface';
import { Adult } from '../models/api/adult.interface';
import { environment } from '../environments/environment.local';
import { FilterOptions } from '../models/api/filter-options.enum';
import { ParticipantsQuery } from '../models/participants-query.interface';
import { ParticipantUpdateInfo } from '../models/api/participant-update-info.interface';

@Injectable({
  providedIn: 'root',
})
export class OrganizerService {
  private readonly http: HttpClient = inject(HttpClient);

  getParticipants(query: ParticipantsQuery): Observable<Participant[]> {
    let params: HttpParams = new HttpParams()
      .append(FilterOptions.Order, query.order)
      .append(FilterOptions.Sort, query.sort);

    if (query.search) {
      params = params.append(FilterOptions.Search, query.search);
    }

    return this.http.get<Participant[]>(`${environment.API_URL}/org/participants`, { 
      params, 
      withCredentials: true 
    });
  }

  getParticipantById(id: number): Observable<Participant | null> {
    return this.http.get<Participant | null>(`${environment.API_URL}/org/participant/${id}`, { withCredentials: true });
  }

  setParticipantCommand(participantId: number, juryId: number | null): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/org/participant/${participantId}/command`, {
      jury_id: juryId
    }, { withCredentials: true });
  }

  updateParticipantInfo(participantId: number, data: ParticipantUpdateInfo): Observable<void> {
    return this.http.patch<void>(`${environment.API_URL}/org/participant/${participantId}`, data, { withCredentials: true });
  }

  removeParticipant(participantId: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/org/participant/${participantId}`, { withCredentials: true });
  }

  getAdults(): Observable<Adult[]> {
    return this.http.get<Adult[]>(`${environment.API_URL}/org/adults`, { withCredentials: true });
  }

  createAdult(data: Omit<Adult, 'id'>): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/org/adult`, data, { withCredentials: true });
  }

  deleteAdult(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/org/adult/${id}`, { withCredentials: true });
  }
}
