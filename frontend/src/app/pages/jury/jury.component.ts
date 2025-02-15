import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink, RouterOutlet } from '@angular/router';
import { takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ParticipantCardComponent } from '@components/participant-card/participant-card.component';
import { BaseComponent } from '@components/base/base.component';
import { LogoutButtonComponent } from '@components/logout-button/logout-button.component';
import { HeaderComponent } from "@components/header/header.component";
import { ApplicationsGroupComponent } from '@components/applications-group/applications-group.component';
import { JuryService } from '@services/jury.service';
import { LocalStorageService } from '@services/local-storage.service';
import { JuryParticipant } from '@models/api/jury-participant.interface';

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
    NzFlexModule,
    ParticipantCardComponent,
    NzTypographyComponent,
    NzSpinComponent,
    LogoutButtonComponent,
    HeaderComponent,
    ApplicationsGroupComponent
  ],
  templateUrl: './jury.component.html',
  styleUrls: ['./jury.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JuryPage extends BaseComponent implements OnInit {
  protected userName: string = '';
  
  protected isParticipantsLoading: boolean = false;
  protected inTeamParticipants: JuryParticipant[] = [];
  protected notRatedParticipants: JuryParticipant[] = [];
  protected ratedParticipants: JuryParticipant[] = [];
  protected zeroRatedParticipants: JuryParticipant[] = [];

  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly juryService: JuryService = inject(JuryService);

  private loadParticipants(): void {
    this.isParticipantsLoading = true;
    this.juryService.getParticipants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: JuryParticipant[]) => {
          for (const participant of data) {
            if (participant.in_command) {
              this.inTeamParticipants.push(participant);    
            } else if (participant.rate && participant.rate.salary > 0) {
              this.ratedParticipants.push(participant);  
            } else if (participant.rate) {
              this.zeroRatedParticipants.push(participant);
            } else {
              this.notRatedParticipants.push(participant);
            }
          }
          
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
}
