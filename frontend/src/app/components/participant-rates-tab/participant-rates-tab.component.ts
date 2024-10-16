import { ChangeDetectionStrategy, Component, inject, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, switchMap, takeUntil } from 'rxjs';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BaseComponent } from '@components/base/base.component';
import { OrganizerService } from '@services/organizer.service';
import { JuryRate, Participant } from '@models/api/participant.interface';
import { Adult } from '@models/api/adult.interface';
import { NzCardModule } from 'ng-zorro-antd/card';
import { BureauStats } from '@models/api/bureau-stats.interface';

export interface JuriesInput {
  juries: Adult[],
  juryBureaus: Record<string, string>,  // Имя -> Название КБ
  bureausStats: Record<string, BureauStats>,  // Название КБ -> Статистика
}

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
    NzCardModule,
  ],
  templateUrl: './participant-rates-tab.component.html',
  styleUrl: './participant-rates-tab.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantRatesTabComponent extends BaseComponent implements OnInit {
  protected ratesTableData: TableData[] = [];
  protected isSettingCommandLoading: boolean = false;
  protected readonly teamControl: FormControl<number | null> = new FormControl<number | null>(null);
  
  @Input({ required: true }) participant!: Participant;
  @Input({ required: true }) juries!: JuriesInput;
  
  private readonly organizerService: OrganizerService = inject(OrganizerService);

  ngOnInit(): void {
    this.initTeamControl();
    this.initTeamControlSubscription();
    this.initRatesTableData();
  }

  private initRatesTableData(): void {
    this.ratesTableData = this.juries.juries.map((jury: Adult) => {
      const juryRate: JuryRate | null = (<Participant>this.participant).rates[jury.id];

      return {
        name: `${this.juries.juryBureaus[jury.name] ?? 'Неизвестное КБ' } (${jury.name})`,
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
        debounceTime(200),
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

  protected bureauSelectorText(jury: Adult): string {
    const name = this.juries.juryBureaus[jury.name] || 'Неизвестное КБ';
    
    let whyDisabled = null;
    if (!this.canSelectBureau(jury)) {
      whyDisabled = this.participant.rates[jury.id] === null
        ? 'нет оценки'
        : 'оценён в 0'
    }

    const stats = this.juries.bureausStats[name] ?? { max_participants: 0, participants: 0 };
    const left = stats.max_participants - stats.participants !== 0
      ? `осталось мест: ${stats.max_participants - stats.participants}`
      : `нет мест`;

    return whyDisabled
      ? `${name} (${whyDisabled}, ${left})`
      : `${name} (${left})`;
  }

  protected canSelectBureau(jury: Adult): boolean {
    const rate = this.participant.rates[jury.id];
    if (rate === null || rate.salary === 0) {
      return false;
    }

    const bureauName = this.juries.juryBureaus[jury.name];
    if (!bureauName) {
      return false;
    }

    const bureauStats = this.juries.bureausStats[bureauName];
    return (bureauStats.max_participants - bureauStats.participants) > 0;
  }
}
