import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { EMPTY, of, switchMap, takeUntil } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BaseComponent } from '../../../../components/base/base.component';
import { AnonymousParticipant } from '../../../../models/api/anonymous-participant.interface';
import { JuryService } from '../../../../services/jury.service';
import { JuryRate } from '../../../../models/api/participant.interface';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { AnswersComponent } from '../../../../components/answers/answers.component';
import { RateApplicationModalComponent } from '../../../../components/rate-application-modal/rate-application-modal.component';
import { BackButtonComponent } from "../../../../components/back-button/back-button.component";
import { MainButtonComponent } from '../../../../components/main-button/main-button.component';

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
    BackButtonComponent,
    MainButtonComponent
],
  providers: [NzModalService],
  templateUrl: './jury-application.component.html',
  styleUrls: ['./jury-application.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JuryApplicationPage extends BaseComponent {
  // TODO: снизу в итоге или посередине инжекты?
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly modalService: NzModalService = inject(NzModalService);
  private readonly juryService: JuryService = inject(JuryService);

  participant: AnonymousParticipant | null = null;
  isParticipantLoading: boolean = false;

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
