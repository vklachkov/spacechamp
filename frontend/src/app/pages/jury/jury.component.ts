import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { JURY_ROOT_PATHS, ROOT_ROUTE_PATHS } from '../../app.routes';
import { JuryService } from '../../services/jury.service';
import { OrganizerService } from '../../services/organizer.service';
import { Participant } from '../../models/api/participant.interface';
import { View } from '../../models/view.enum';

@Component({
  selector: 'app-jury-page',
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
  templateUrl: './jury.component.html',
  styleUrls: ['./jury.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JuryPage implements OnInit {
  juriId: number = 1;
  View = View;

  participants: Participant[] = [];

  inTeamParticipants: Participant[] = [];
  notEvaluatedParticipants: Participant[] = [];
  evaluatedParticipants: Participant[] = [];

  private readonly router: Router = inject(Router);

  ngOnInit(): void {
    // this.inTeamParticipants = this.participants;
    // this.notEvaluatedParticipants = this.participants.filter((participant: Participant) => participant.scores[this.juriId] === undefined);
    // this.evaluatedParticipants = this.participants.filter((participant: Participant) => participant.scores[this.juriId] !== undefined);
  }

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }

  goToApplication(id: number): void {
    this.router.navigate([JURY_ROOT_PATHS.Application, id]);
  }
}
