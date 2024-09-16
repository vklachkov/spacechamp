import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { combineLatest, debounceTime, delay, EMPTY, map, Observable, of, switchMap, take, takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { JuryRate, Participant, ParticipantInfo } from '../../../../models/api/participant.interface';
import { OrganizerService } from '../../../../services/organizer.service';
import { BaseComponent } from '../../../../components/base/base.component';
import { Adult } from '../../../../models/api/adult.interface';
import { AdultRole } from '../../../../models/api/adult-role.enum';
import { AuthService } from '../../../../services/auth.service';
import { LocalStorageService } from '../../../../services/local-storage.service';

interface TableData {
  name: string, 
  salary: number | string, 
  comment: string
}

type FormGroupType = {
  name: FormControl<string | null>,
  city: FormControl<string | null>,
  district: FormControl<string | null>,
  phone_number: FormControl<string | null>,
  email: FormControl<string | null>,
  edu_org: FormControl<string | null>,
  responsible_adult_name: FormControl<string | null>,
  responsible_adult_phone_number: FormControl<string | null>
}

type FormGroupValue = {
  name?: string | null,
  city?: string | null,
  district?: string | null,
  phone_number?: string | null,
  email?: string | null,
  edu_org?: string | null,
  comment?: string | null,
  responsible_adult_name?: string | null,
  responsible_adult_phone_number?: string | null
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
    NzButtonComponent,
    NzIconModule,
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NzFormModule,
    NzInputDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
  ],
  templateUrl: './organizer-participant.component.html',
  styleUrls: ['./organizer-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerParticipantPage extends BaseComponent implements OnInit {
  participant: Participant | null = null;
  isParticipantInfoUpdating: boolean = false;
  participantInfoForm: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    district: new FormControl<string | null>(null),
    phone_number: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    edu_org: new FormControl<string | null>(null),
    responsible_adult_name: new FormControl<string | null>(null),
    responsible_adult_phone_number: new FormControl<string | null>(null),
  });

  isDataLoading: boolean = false;
  juries: Adult[] = [];
  ratesTableData: TableData[] = [];

  isSettingCommandLoading: boolean = false;
  teamControl: FormControl<number | null> = new FormControl<number | null>(null);

  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly authService: AuthService = inject(AuthService);

  private initRatesTableData(): void {
    if (this.participant) {
      this.ratesTableData = this.juries.map((jury: Adult) => {
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

  private initTeamControl(): void {
    this.teamControl.setValue(this.participant?.jury?.id ?? null, { emitEvent: false });
  }

  private patchForm(): void {
    if (this.participant) {
      this.participantInfoForm.patchValue(this.participant?.info, { emitEvent: false });
    }
  }

  private loadData(): void {
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
    
    this.isDataLoading = true;
    combineLatest([
      participant$,
      juries$
    ])
      .pipe(take(1), takeUntil(this.destroy$))
      .subscribe({
        next: ([participant, juries]: [Participant | null, Adult[]]) => {
          this.juries = juries;
          this.participant = participant;

          this.patchForm();
          this.initTeamControl();
          this.initRatesTableData();

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

  private initFormSubscription(): void {
    this.participantInfoForm.valueChanges
      .pipe(
        debounceTime(350),
        switchMap((value: FormGroupValue) => {
          if (this.participantInfoForm.invalid) {
            return EMPTY;
          }

          this.isParticipantInfoUpdating = true;
          this.cdr.markForCheck();

          const formValue: Omit<ParticipantInfo, 'photo_url'> = <Omit<ParticipantInfo, 'photo_url'>>value;
          const newInfo: ParticipantInfo = {
            ...formValue,
            photo_url: (<Participant>this.participant).info.photo_url
          }
          return this.organizerService.updateParticipantInfo((<Participant>this.participant).id, newInfo);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.isParticipantInfoUpdating = false;
          this.cdr.markForCheck();
          // this.messageService.success('Данные участника обновлены');
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantInfoUpdating = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при обновлении данных об участнике', err);
        }
      });
  }

  ngOnInit(): void {
    this.loadData();
    this.initTeamControlSubscription();
    this.initFormSubscription();
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

  goToParticipants(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Index]);
  }
}
