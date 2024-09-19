import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { debounceTime, EMPTY, switchMap, takeUntil } from 'rxjs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { AnswersComponent } from '../answers/answers.component';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { BaseComponent } from '../base/base.component';
import { Participant, ParticipantInfo } from '../../models/api/participant.interface';
import { OrganizerService } from '../../services/organizer.service';

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
  selector: 'app-participant-questionnarie-tab',
  standalone: true,
  imports: [
    NzCardComponent, 
    NzAvatarComponent, 
    NzSpinComponent, 
    NzFormModule,
    NzInputDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    FormsModule, 
    ReactiveFormsModule,
    AnswersComponent
  ],
  templateUrl: './participant-questionnarie-tab.component.html',
  styleUrl: './participant-questionnarie-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantQuestionnarieTabComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) participant!: Participant;

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

  private readonly organizerService: OrganizerService = inject(OrganizerService);

  ngOnInit(): void {
    this.patchForm()
    this.initFormSubscription();
  }

  private patchForm(): void {
    this.participantInfoForm.patchValue(this.participant.info, { emitEvent: false });
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
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantInfoUpdating = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при обновлении данных об участнике', err);
        }
      });
  }
}
