import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { JuriScore, Participant } from '../../models/participant';
import { ROOT_ROUTE_PATHS } from '../../app.routes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzLayoutModule,
    NzButtonComponent,
    NzIconModule,
    NzInputModule,
    NzFlexModule,
    KnownParticipantCardComponent,
  ],
  templateUrl: './jury-panel.component.html',
  styleUrls: ['./jury-panel.component.scss']
})
export class JuryPanelPage {
  juriId: number = 1;

  participants: Participant[] = Array.from({ length: 50 }, (_, index) => {
    return {
      id: index + 1,
      info: undefined,
      answers: {},
      scores: index % 9 !== 0
      ? <Record<number, JuriScore>>{ 1: { rate: 4, comment: "Норм участник" } }
      : <Record<number, JuriScore>>{ },
    };
  });

  private readonly router: Router = inject(Router);

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }
}
