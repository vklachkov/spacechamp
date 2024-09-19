import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { Participant } from '../../../../models/api/participant.interface';
import { OrganizerService } from '../../../../services/organizer.service';
import { BaseComponent } from '../../../../components/base/base.component';
import { Adult } from '../../../../models/api/adult.interface';
import { AdultRole } from '../../../../models/api/adult-role.enum';
import { AnswersComponent } from '../../../../components/answers/answers.component';
import { MainButtonComponent } from '../../../../components/main-button/main-button.component';
import { LogoutButtonComponent } from '../../../../components/logout-button/logout-button.component';
import { HeaderComponent } from '../../../../components/header/header.component';
import { ParticipantQuestionnarieTabComponent } from '../../../../components/participant-questionnarie-tab/participant-questionnarie-tab.component';
import { ParticipantRatesTabComponent } from '../../../../components/participant-rates-tab/participant-rates-tab.component';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzTabSetComponent,
    NzTabComponent,
    NzSpinComponent,
    NzIconModule,
    NzButtonComponent,
    AnswersComponent,
    LogoutButtonComponent,
    MainButtonComponent,
    HeaderComponent,
    ParticipantQuestionnarieTabComponent,
    ParticipantRatesTabComponent,
    ParticipantRatesTabComponent,
  ],
  templateUrl: './organizer-participant.component.html',
  styleUrls: ['./organizer-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrganizerParticipantPage extends BaseComponent implements OnInit {
  participant: Participant | null = null;

  isDataLoading: boolean = false;
  juries: Adult[] = [];

  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly organizerService: OrganizerService = inject(OrganizerService);

  private loadData(): void {
    const participant$: Observable<Participant | null> =
      this.activatedRoute.paramMap.pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          return this.organizerService.getParticipantById(+id);
        })
      );
    const juries$: Observable<Adult[]> = this.organizerService
      .getAdults()
      .pipe(
        map((data: Adult[]) =>
          data.filter((item: Adult) => item.role === AdultRole.Jury)
        )
      );

    this.isDataLoading = true;
    combineLatest([participant$, juries$])
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: ([participant, juries]: [Participant | null, Adult[]]) => {
          this.juries = juries;
          this.participant = participant;

          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isDataLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification(
            'Ошибка при получении данных об участнике и жюри',
            err
          );
        },
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  remove(): void {
    this.isDataLoading = true;
    this.organizerService.removeParticipant((<Participant>this.participant).id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate([ROOT_ROUTE_PATHS.Index]);
          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isDataLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при удалении участника', err);
        }
      });
  }
}
