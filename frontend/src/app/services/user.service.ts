import { Injectable } from '@angular/core';
import { Adult } from '@models/api/adult.interface';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private user: Adult | null = null;

  setUser(user: Adult): void {
    this.user = user;
  }

  getUser(): Adult {
    if (!this.user) {
      throw Error('Пользователь не известен');
    }

    return this.user;
  }
}
