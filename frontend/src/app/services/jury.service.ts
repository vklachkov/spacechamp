import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment.local';
import { FilterOptions } from '@models/api/filter-options.enum';
import { JuryParticipant } from '@models/api/jury-participant.interface';
import { BureauStats } from '@models/api/bureau-stats.interface';
import { Order } from '@models/api/order.enum';
import { JuryRate } from '@models/api/participant.interface';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class JuryService {
  private readonly http: HttpClient = inject(HttpClient);

  stats(): Observable<BureauStats> {
    return this.http.get<BureauStats>(`${environment.API_URL}/jury/stats`);
  }

  getParticipants(): Observable<JuryParticipant[]> {
    const params: HttpParams = new HttpParams().append(FilterOptions.Order, Order.ASC);
    
    return this.http.get<JuryParticipant[]>(`${environment.API_URL}/jury/participants`, { 
      params,
    });
  }

  getParticipantById(id: number): Observable<JuryParticipant | null> {
    return this.http.get<JuryParticipant | null>(`${environment.API_URL}/jury/participant/${id}`);
  }

  rateParticipant(participantId: number, rate: JuryRate): Observable<void> {
    return this.http.post<void>(`${environment.API_URL}/jury/participant/${participantId}/rate`, rate);
  }
}
