import { ChangeDetectionStrategy, Component, HostListener, inject, Input, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { environment } from '@environments/environment.local';
import { BaseComponent } from '@components/base/base.component';
import { AnswersComponent } from '@components/answers/answers.component';
import { AnswersEditableComponent } from '@components/answers-editable/answers-editable.component';
import { OrganizerService } from '@services/organizer.service';
import { DownloadService } from '@services/download.service';
import { QA, Participant, ParticipantInfo } from '@models/api/participant.interface';
import { ParticipantUpdateInfo } from '@models/api/participant-update-info.interface';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';

export enum Mode {
  View,
  Edit,
}

export type AnswersFormType = {
  [key: string]: FormControl<string | null>
}

type FormGroupType = {
  name: FormControl<string | null>,
  city: FormControl<string | null>,
  district: FormControl<string | null>,
  phone_number: FormControl<string | null>,
  email: FormControl<string | null>,
  edu_org: FormControl<string | null>,
  responsible_adult_name: FormControl<string | null>,
  responsible_adult_phone_number: FormControl<string | null>,
  answers: FormGroup<AnswersFormType>
}

type FormValue = Omit<ParticipantInfo, 'photo_url'> & { answers: QA }; 

@Component({
  selector: 'app-participant-questionnarie-tab',
  standalone: true,
  imports: [
    NzCardComponent, 
    NzAvatarComponent, 
    NzSpinComponent,
    NzIconModule,
    NzButtonComponent,
    NzFormModule,
    NzInputDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzTypographyComponent,
    NzPopconfirmDirective,
    FormsModule, 
    ReactiveFormsModule,
    AnswersComponent,
    AnswersEditableComponent,
    NzCheckboxModule,
  ],
  templateUrl: './participant-questionnarie-tab.component.html',
  styleUrl: './participant-questionnarie-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantQuestionnarieTabComponent extends BaseComponent implements OnDestroy {
  protected isDeleting: boolean = false;
  protected isCalling: boolean = false;
  protected isParticipantInfoUpdating: boolean = false;
  
  protected readonly Mode = Mode;
  
  mode: Mode = Mode.View;
  readonly infoForm: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    district: new FormControl<string | null>(null),
    phone_number: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    edu_org: new FormControl<string | null>(null),
    responsible_adult_name: new FormControl<string | null>(null),
    responsible_adult_phone_number: new FormControl<string | null>(null),
    answers: new FormGroup<AnswersFormType>({})
  });

  @Input({ required: true }) participant!: Participant;
  
  private readonly router: Router = inject(Router);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly downloadService: DownloadService = inject(DownloadService);

  private initAnswersForm(): void {
    Object.entries(this.participant.answers).forEach(([question, answer]) => {
      (<FormGroup<AnswersFormType>>this.infoForm.get('answers')).addControl(question, new FormControl<string | null>(answer)); 
    });
  }

  getAnswersForm(): FormGroup<AnswersFormType> {
    return <FormGroup<AnswersFormType>>this.infoForm.get('answers');
  }

  enterEditMode(): void {
    this.infoForm.patchValue(this.participant.info);
    this.initAnswersForm();

    this.mode = Mode.Edit;
    this.cdr.markForCheck();
  }

  saveChanges(): void {
    const formValue: FormValue = <FormValue>this.infoForm.value;
    const { answers, ...infoWithoutUrl } = formValue;

    const infoWithUrl: ParticipantInfo = {
      ...infoWithoutUrl,
      photo_url: (<Participant>this.participant).info.photo_url
    }
    const newInfo: ParticipantUpdateInfo = {
      ...infoWithUrl,
      answers
    }

    this.isParticipantInfoUpdating = true;
    this.cdr.markForCheck();

    this.organizerService.updateParticipantInfo((<Participant>this.participant).id, newInfo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.participant.info = infoWithUrl;
          this.participant.answers = answers;

          this.isParticipantInfoUpdating = false;
          this.mode = Mode.View;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantInfoUpdating = false;
          this.cdr.markForCheck();

          this.showErrorNotification('Ошибка при обновлении данных об участнике', err);
        },
      });
  }

  cancelEdit(): void {
    this.mode = Mode.View;
    this.cdr.markForCheck();
  }

  callParticipant(): void {
    this.isCalling = true;
    this.cdr.markForCheck();

    this.organizerService.setParticipantHasCall(this.participant.id, this.participant.has_call)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isCalling = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isCalling = false;
          this.participant.has_call = !this.participant.has_call;
          this.cdr.markForCheck();

          this.showErrorNotification('Ошибка при вызове участника', err);
        }
      });
  }

  remove(): void {
    this.isDeleting = true;
    this.cdr.markForCheck();

    this.organizerService.removeParticipant(this.participant.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.router.navigate([ROOT_ROUTE_PATHS.Index]);
        },
        error: (err: HttpErrorResponse) => {
          this.isDeleting = false;
          this.cdr.markForCheck();

          this.showErrorNotification('Ошибка при удалении участника', err);
        }
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  onRefreshPage(event: Event) {
    if (!environment.production) {
      return;
    }
    const confirmationMessage = 'Сбросить несохранённые изменения и уйти со страницы?';
    event.returnValue = false;
    return confirmationMessage;
  }
}
