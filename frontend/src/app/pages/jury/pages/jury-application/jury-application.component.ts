import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, of, switchMap, takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BaseComponent } from '@components/base/base.component';
import { AnswersComponent } from '@components/answers/answers.component';
import { RateApplicationModalComponent } from '@components/rate-application-modal/rate-application-modal.component';
import { MainButtonComponent } from '@components/main-button/main-button.component';
import { LogoutButtonComponent } from '@components/logout-button/logout-button.component';
import { HeaderComponent } from '@components/header/header.component';
import { JuryService } from '@services/jury.service';
import { AnonymousParticipant } from '@models/api/anonymous-participant.interface';
import { JuryRate } from '@models/api/participant.interface';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzIconModule,
    NzSpinComponent,
    AsyncPipe,
    AnswersComponent,
    LogoutButtonComponent,
    MainButtonComponent,
    HeaderComponent
  ],
  templateUrl: './jury-application.component.html',
  styleUrls: ['./jury-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JuryApplicationPage extends BaseComponent {
  participant: AnonymousParticipant | null = null;
  isParticipantLoading: boolean = false;

  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly modalService: NzModalService = inject(NzModalService);
  private readonly juryService: JuryService = inject(JuryService);

  private loadParticipant(): void {
    this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          this.isParticipantLoading = true;
          this.cdr.markForCheck();

          return this.juryService.getParticipantById(+id);
        }),
      )
      .subscribe({
        next: (data: AnonymousParticipant | null) => {
          this.participant = data;
          this.isParticipantLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении заявки', err);
        }
      });
  }

  ngOnInit(): void {
    this.loadParticipant();
  }

  openRateModal(): void {
    this.modalService.create<RateApplicationModalComponent, AnonymousParticipant | null, JuryRate>({
      nzTitle: 'Оценка',
      nzContent: RateApplicationModalComponent,
      nzData: this.participant
    }).afterClose
      .pipe(
        switchMap((data: JuryRate | undefined) => {
          if (!data) {
            return EMPTY;
          }

          this.isParticipantLoading = true;
          this.cdr.markForCheck();
          return this.juryService.rateParticipant((<AnonymousParticipant>this.participant).id, data);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.loadParticipant();
          this.messageService.success('Участник успешно оценен');
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при оценке участника', err);
        }
      });
  }
}
