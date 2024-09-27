import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Participant } from '@models/api/participant.interface';
import { Adult } from '@models/api/adult.interface';
import { environment } from '@environments/environment.local';
import { FilterOptions } from '@models/api/filter-options.enum';
import { ParticipantsQuery } from '@models/participants-query.interface';
import { ParticipantUpdateInfo } from '@models/api/participant-update-info.interface';

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
    });
  }

  getParticipantsReport(): Observable<ArrayBuffer> {
    return this.http.get(`${environment.API_URL}/org/participants/report`, {
      responseType: 'arraybuffer'
    })
  }

  getParticipantById(id: number): Observable<Participant | null> {
    return this.http.get<Participant | null>(`${environment.API_URL}/org/participant/${id}`);
  }

  setParticipantCommand(participantId: number, juryId: number | null): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/org/participant/${participantId}/command`, {
      jury_id: juryId
    });
  }

  updateParticipantInfo(participantId: number, data: ParticipantUpdateInfo): Observable<void> {
    return this.http.patch<void>(`${environment.API_URL}/org/participant/${participantId}`, data);
  }

  removeParticipant(participantId: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/org/participant/${participantId}`);
  }

  getAdults(): Observable<Adult[]> {
    return this.http.get<Adult[]>(`${environment.API_URL}/org/adults`);
  }

  createAdult(data: Omit<Adult, 'id'>): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/org/adult`, data);
  }

  deleteAdult(id: number): Observable<void> {
    return this.http.delete<void>(`${environment.API_URL}/org/adult/${id}`);
  }
}
