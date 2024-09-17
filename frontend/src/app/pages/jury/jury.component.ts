import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { takeUntil } from 'rxjs';
import { ParticipantCardComponent } from '../../components/participant-card/participant-card.component';
import { JURY_ROOT_PATHS } from '../../app.routes';
import { JuryService } from '../../services/jury.service';
import { BaseComponent } from '../../components/base/base.component';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';
import { LocalStorageService } from '../../services/local-storage.service';
import { BackButtonComponent } from "../../components/back-button/back-button.component";

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
    ParticipantCardComponent,
    NzTypographyComponent,
    NzSpinComponent,
    BackButtonComponent
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

  goToApplication(id: number): void {
    this.router.navigate([JURY_ROOT_PATHS.Application, id]);
  }
}
