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
import { AuthService } from '../../services/auth.service';
import { BaseComponent } from '../../components/base/base.component';
import { takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';
import { LocalStorageService } from '../../services/local-storage.service';

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
export class JuryPage extends BaseComponent implements OnInit {
  userName: string = '';
  
  isParticipantsLoading: boolean = false;
  inTeamParticipants: AnonymousParticipant[] = [];
  notRatedParticipants: AnonymousParticipant[] = [];
  ratedParticipants: AnonymousParticipant[] = [];

  private readonly router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly juryService: JuryService = inject(JuryService);

  private loadParticipants(): void {
    this.isParticipantsLoading = true;
    this.juryService.getParticipants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: AnonymousParticipant[]) => {
          this.inTeamParticipants = data.filter((item: AnonymousParticipant) => item.in_command);
          const inTeamIds: number[] = this.inTeamParticipants.map((item: AnonymousParticipant) => item.id);

          this.ratedParticipants = data.filter((item: AnonymousParticipant) => !inTeamIds.includes(item.id) && item.rate);
          this.notRatedParticipants = data.filter((item: AnonymousParticipant) => !inTeamIds.includes(item.id) && !item.rate);

          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении участников', err);
        }
      });
  }

  ngOnInit(): void {
    this.loadParticipants();

    this.userName = this.localStorageService.getName();
  }

  goToLogin(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.localStorageService.clearAuthData();
          this.router.navigate([ROOT_ROUTE_PATHS.Login]);
        },
        error: (err: HttpErrorResponse) => {
          this.showErrorNotification('Ошибка при выходе', err);
        }
      });
  }

  goToApplication(id: number): void {
    this.router.navigate([JURY_ROOT_PATHS.Application, id]);
  }
}
