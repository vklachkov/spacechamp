import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import {
  combineLatest,
  map,
  Observable,
  of,
  switchMap,
  take,
  takeUntil,
} from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { BaseComponent } from '@components/base/base.component';
import { AnswersComponent } from '@components/answers/answers.component';
import { MainButtonComponent } from '@components/main-button/main-button.component';
import { LogoutButtonComponent } from '@components/logout-button/logout-button.component';
import { HeaderComponent } from '@components/header/header.component';
import { Mode, ParticipantQuestionnarieTabComponent } from '@components/participant-questionnarie-tab/participant-questionnarie-tab.component';
import { JuriesInput, ParticipantRatesTabComponent } from '@components/participant-rates-tab/participant-rates-tab.component';
import { OrganizerService } from '@services/organizer.service';
import { Participant } from '@models/api/participant.interface';
import { Adult } from '@models/api/adult.interface';
import { AdultRole } from '@models/api/adult-role.enum';
import { BureauStats } from '@models/api/bureau-stats.interface';

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
  protected isDataLoading: boolean = false;
  protected participant: Participant | null = null;
  protected juries: JuriesInput | null = null;

  @ViewChild(ParticipantQuestionnarieTabComponent, { static: false }) 
  readonly questionnarieTab!: ParticipantQuestionnarieTabComponent | null;
  
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

    const juryBureaus$: Observable<Record<string, string>> = this.organizerService.getJuryBureau();
    const bureausStats$: Observable<Record<string, BureauStats>> = this.organizerService.getBureausStats();

    this.isDataLoading = true;
    this.cdr.markForCheck();

    combineLatest([participant$, juries$, juryBureaus$, bureausStats$])
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: ([participant, juries, juryBureaus, bureausStats]) => {
          this.participant = participant;
          this.juries = {
            juries: juries,
            juryBureaus: juryBureaus,
            bureausStats: bureausStats,
          };

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

  formHasChanges(): boolean {
    return this.questionnarieTab?.mode === Mode.Edit &&
      this.questionnarieTab?.infoForm?.dirty;
  }
}
