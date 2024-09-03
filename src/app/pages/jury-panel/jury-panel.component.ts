import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { JuriScore, Participant } from '../../models/participant';
import { ViewType } from '../admin-panel/admin-panel';
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
    NzTypographyComponent
  ],
  templateUrl: './jury-panel.component.html',
  styleUrls: ['./jury-panel.component.scss']
})
export class JuryPanelPage implements OnInit {
  juriId: number = 1;
  ViewType = ViewType;

  participants: Participant[] = Array.from({ length: 50 }, (_, index) => {
    return {
      id: index + 1,
      info: undefined,
      answers: {},
      scores: index % 9 !== 0
      ? <Record<number, JuriScore>>{ 1: { salary: 4, comment: "Норм участник" } }
      : <Record<number, JuriScore>>{ },
    };
  });

  inTeamParticipants: Participant[] = [];
  notEvaluatedParticipants: Participant[] = [];
  evaluatedParticipants: Participant[] = [];

  private readonly router: Router = inject(Router);

  ngOnInit(): void {
    // this.inTeamParticipants = this.participants;
    this.notEvaluatedParticipants = this.participants.filter((participant: Participant) => participant.scores[this.juriId] === undefined);
    this.evaluatedParticipants = this.participants.filter((participant: Participant) => participant.scores[this.juriId] !== undefined);
  }

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }
}
