import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginInput } from '../models/api/login-input.interface';
import { LoginOutput } from '../models/api/login-output.interface';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);

  login(data: LoginInput): Observable<LoginOutput> {
    return this.http.post<LoginOutput>('api/v1/login', data);
  }

  logout(): Observable<void> {
    return this.http.post<void>('api/v1/logout', null);
  }
}
