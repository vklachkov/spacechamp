import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { combineLatest, delay, EMPTY, forkJoin, map, Observable, of, switchMap, take, takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { JuryRate, Participant } from '../../../../models/api/participant.interface';
import { OrganizerService } from '../../../../services/organizer.service';
import { BaseComponent } from '../../../../components/base/base.component';
import { Adult } from '../../../../models/api/adult.interface';
import { AdultRole } from '../../../../models/api/adult-role.enum';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../services/auth.service';

interface TableData {
  name: string, 
  salary: number | string, 
  comment: string
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzTabSetComponent,
    NzTabComponent,
    NzCardComponent,
    NzAvatarComponent,
    NzIconModule,
    NzSelectComponent,
    NzOptionComponent,
    NzTableModule,
    NzSpinComponent,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './organizer-participant.component.html',
  styleUrls: ['./organizer-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerParticipantPage extends BaseComponent implements OnInit {
  participant: Participant | null = null;
  juries: Adult[] = [];
  isDataLoading: boolean = false;
  tableData: TableData[] = [];

  isSettingCommandLoading: boolean = false;
  teamControl: FormControl<number | null> = new FormControl<number | null>(null);

  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly authService: AuthService = inject(AuthService);

  private initTableData(): void {
    if (this.participant) {
      this.tableData = this.juries.map((jury: Adult) => {
        const juryRate: JuryRate | null = (<Participant>this.participant).rates[jury.id];

        return {
          name: jury.name,
          salary: juryRate?.salary ?? '—',
          comment: juryRate?.comment ?? 'Нет оценки'
        }
      });
    } else {
      console.warn('Нет данных об участнике при инициализации данных в таблице с оценками');
    }
  }

  private loadData(): void {
    this.isDataLoading = true;
    const participant$: Observable<Participant | null> = this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          return this.organizerService.getParticipantById(+id);
        })
      );
    const juries$: Observable<Adult[]> = this.organizerService.getAdults()
      .pipe(
        map((data: Adult[]) => data.filter((item: Adult) => item.role === AdultRole.Jury))
      );

    this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          return forkJoin([this.organizerService.getParticipantById(+id), juries$]);
        })
      );

    combineLatest([
      participant$,
      juries$
    ])
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: ([participant, juries]: [Participant | null, Adult[]]) => {
          this.juries = juries;
          this.participant = participant;

          this.teamControl.setValue(this.participant?.jury_id ?? null, { emitEvent: false });
          this.initTableData();

          this.isDataLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isDataLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении данных об участнике и жюри', err);
        }
      })
  }

  private initTeamControlSubscription(): void {
    this.teamControl.valueChanges
      .pipe(
        delay(200),
        switchMap((value: number | null) => {
          this.isSettingCommandLoading = true;
          this.cdr.markForCheck();

          return this.organizerService.setParticipantCommand(
            (<Participant>this.participant).id,
            value
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.messageService.success(this.teamControl.value ? 'Команда обновлена' : 'Участник без команды');

          this.isSettingCommandLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isSettingCommandLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при установке команды для участника', err);
        }
      });
  }

  ngOnInit(): void {
    this.loadData();
    this.initTeamControlSubscription();
  }

  goToLogin(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate([ROOT_ROUTE_PATHS.Login]);
        },
        error: (err: HttpErrorResponse) => {
          this.showErrorNotification('Ошибка при выходе', err);
        }
      });
  }
}
