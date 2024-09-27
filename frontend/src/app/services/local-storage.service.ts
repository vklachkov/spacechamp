import { Injectable } from '@angular/core';
import { ROLE_KEY } from '@models/role-key.constant';
import { Role } from '@models/api/role.enum';
import { Adult } from '@models/api/adult.interface';
import { USER_ID_KEY } from '@models/user-id-key.constant';
import { NAME_KEY } from '@models/name-key.constant';
import { SCROLL_INDEX_KEY } from '@models/scroll-index.constant';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  private setItem<T>(key: string, value: T): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  private getItem<T>(key: string): T {
    return <T>JSON.parse(<string>localStorage.getItem(key));
  }

  private clear(): void {
    localStorage.clear();
  }

  setAuthData(data: Adult): void {
    this.setItem<number>(USER_ID_KEY, data.id);
    this.setItem<string>(NAME_KEY, data.name);
    this.setItem<string>(ROLE_KEY, data.role);
  }

  setScrollIndex(index: number): void {
    this.setItem<number>(SCROLL_INDEX_KEY, index);
  }

  getRole(): Role {
    return this.getItem<Role>(ROLE_KEY);
  }

  getName(): string {
    return this.getItem<string>(NAME_KEY);
  }

  getUserId(): number {
    return this.getItem<number>(USER_ID_KEY);
  }

  getScrollIndex(): number {
    return this.getItem<number>(SCROLL_INDEX_KEY);
  }

  clearData(): void {
    this.clear();
  }
}
