import { inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { WINDOW } from '../app.config';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private readonly router: Router = inject(Router);
  private readonly location: Location = inject(Location);
  private readonly window: Window = inject(WINDOW);

  back(urlIfFirstUrl: string): void {
    if (this.window.history.length > 0) {
      this.location.back();
    } else {
      this.router.navigate([urlIfFirstUrl]);
    }
  }
}
