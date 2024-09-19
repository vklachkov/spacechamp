import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { BaseComponent } from '../base/base.component';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTableComponent, NzTableModule } from 'ng-zorro-antd/table';
import { CommonModule } from '@angular/common';
import { JuryRate, Participant, Rates } from '../../models/api/participant.interface';
import { Adult } from '../../models/api/adult.interface';
import { delay, switchMap, takeUntil } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OrganizerService } from '../../services/organizer.service';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

interface TableData {
  name: string, 
  salary: number | string, 
  comment: string
}


@Component({
  selector: 'app-participant-rates-tab',
  standalone: true,
  imports: [
    CommonModule,
    NzSpinComponent,
    NzSelectComponent,
    NzOptionComponent,
    NzTableModule,
    NzTypographyComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './participant-rates-tab.component.html',
  styleUrl: './participant-rates-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantRatesTabComponent extends BaseComponent implements OnInit {
  @Input({ required: true }) participant!: Participant;
  @Input({ required: true }) juries: Adult[] = [];

  ratesTableData: TableData[] = [];

  isSettingCommandLoading: boolean = false;
  teamControl: FormControl<number | null> = new FormControl<number | null>(null);

  private readonly organizerService: OrganizerService = inject(OrganizerService);

  ngOnInit(): void {
    this.initTeamControl();
    this.initTeamControlSubscription();
    this.initRatesTableData();
  }

  private initRatesTableData(): void {
    this.ratesTableData = this.juries.map((jury: Adult) => {
      const juryRate: JuryRate | null = (<Participant>this.participant).rates[jury.id];

      return {
        name: jury.name,
        salary: juryRate?.salary ?? '—',
        comment: juryRate?.comment ?? 'Нет оценки'
      }
    });
  }

  private initTeamControl(): void {
    this.teamControl.setValue(this.participant.jury?.id ?? null, { emitEvent: false });
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
}
