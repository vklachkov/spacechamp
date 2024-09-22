import { ChangeDetectionStrategy, Component, HostListener, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { AnswersComponent } from '../answers/answers.component';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { BaseComponent } from '../base/base.component';
import { Participant, ParticipantInfo } from '../../models/api/participant.interface';
import { OrganizerService } from '../../services/organizer.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { DownloadService } from '../../services/download.service';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { Router } from '@angular/router';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';

export enum Mode {
  View,
  Edit,
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
  ],
  templateUrl: './participant-questionnarie-tab.component.html',
  styleUrl: './participant-questionnarie-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantQuestionnarieTabComponent extends BaseComponent implements OnDestroy {
  @Input({ required: true }) participant!: Participant;

  isDeleting: boolean = false;

  mode: Mode = Mode.View;
  Mode = Mode;

  isParticipantInfoUpdating: boolean = false;
  infoForm: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null),
    city: new FormControl<string | null>(null),
    district: new FormControl<string | null>(null),
    phone_number: new FormControl<string | null>(null),
    email: new FormControl<string | null>(null),
    edu_org: new FormControl<string | null>(null),
    responsible_adult_name: new FormControl<string | null>(null),
    responsible_adult_phone_number: new FormControl<string | null>(null),
  });

  private readonly router: Router = inject(Router);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly downloadService: DownloadService = inject(DownloadService);

  enterEditMode(): void {
    this.infoForm.patchValue(this.participant.info);

    this.mode = Mode.Edit;
    this.cdr.markForCheck();
  }

  saveChanges(): void {
    const formValue: Omit<ParticipantInfo, 'photo_url'> = <Omit<ParticipantInfo, 'photo_url'>>this.infoForm.value;
    const newInfo: ParticipantInfo = {
      ...formValue,
      photo_url: (<Participant>this.participant).info.photo_url
    }

    this.isParticipantInfoUpdating = true;
    this.cdr.markForCheck();

    this.organizerService.updateParticipantInfo((<Participant>this.participant).id, newInfo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.participant.info = newInfo;

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

  remove(): void {
    this.isDeleting = true;
    this.organizerService.removeParticipant((<Participant>this.participant).id)
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

  downloadPhoto(): void {
    const url: string = this.participant.info.photo_url;
    this.downloadService.download(url, `Фото участника ${this.participant.code}`)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        error: (err: object) => {
          this.notificationService.error('Ошибка', `Ошибка при скачивании файла ${url}`);
          console.error(`Ошибка при скачивании файла ${url}: `, err);
        }
      });
  }

  @HostListener('window:beforeunload', ['$event'])
  onRefreshPage(event: Event) {
    const confirmationMessage = 'Сбросить несохранённые изменения и уйти со страницы?';
    event.returnValue = false;
    return confirmationMessage;
  }
}
