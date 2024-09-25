import { inject, Injectable } from '@angular/core';
import { Location } from '@angular/common';
import { Router, RoutesRecognized } from '@angular/router';
import { filter, map, pairwise } from 'rxjs';

// https://www.damirscorner.com/blog/posts/20220610-InspectingPreviousPageInAngular.html
@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private previousUrl: string | null = null;

  private readonly router: Router = inject(Router);
  private readonly location: Location = inject(Location);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof RoutesRecognized),
        map((event) => event as RoutesRecognized),
        pairwise()
      )
      .subscribe({
        next: (events: [RoutesRecognized, RoutesRecognized]) => {
          this.previousUrl = events[0].urlAfterRedirects;
        },
      });
  }

  back(urlIfFirstUrl: string): void {
    if (this.previousUrl) {
      this.location.back();
    } else {
      this.router.navigate([urlIfFirstUrl]);
    }
  }
}
