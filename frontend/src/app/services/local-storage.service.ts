import { Injectable } from '@angular/core';
import { LoginOutput } from '../models/api/login-output.interface';
import { TOKEN_KEY } from '../models/token-key.constant';
import { ROLE_KEY } from '../models/role-key.constant';
import { Role } from '../models/api/role.enum';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getItem<T>(key: string): T {
    return <T>localStorage.getItem(key);
  }

  private clear(): void {
    localStorage.clear();
  }

  setAuthData(data: LoginOutput): void {
    this.setItem<string>(TOKEN_KEY, data.token);
    this.setItem<string>(ROLE_KEY, data.role);
  }

  getToken(): string {
    return this.getItem<string>(TOKEN_KEY);
  }

  getRole(): Role {
    return this.getItem<Role>(ROLE_KEY);
  }

  clearAuthData(): void {
    this.clear();
  }
}
