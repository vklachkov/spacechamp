import { ChangeDetectionStrategy, Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { JuryRate, Participant } from '../../models/api/participant.interface';
import { ParticipantStatus } from '../../models/participant-status.enum';
import { ORGANIZER_ROOT_PATHS } from '../../app.routes';

@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzAvatarModule, RouterLink],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantCardComponent implements OnInit, OnChanges {
  @Input({ required: true }) participant!: Participant;

  status: ParticipantStatus | null = null;
  ParticipantStatus = ParticipantStatus;

  participantPath: string = ORGANIZER_ROOT_PATHS.Participant;

  private getStatus(): ParticipantStatus | null {
    if (this.participant.jury?.id) {
      return ParticipantStatus.InTeam;
    }

    if (Object.values(this.participant.rates).every((rate: JuryRate | null) => !rate)) {
      return ParticipantStatus.NotRated;
    }

    if (Object.values(this.participant.rates).every((rate: JuryRate | null) => rate)) {
      return ParticipantStatus.FullRated;
    }

    if (Object.values(this.participant.rates).some((rate: JuryRate | null) => rate)) {
      return ParticipantStatus.PartiallyRated;
    }

    return null;
  }

  ngOnChanges(): void {
    // Виртуал скролл не переставляет элементы в списке, а подменяет одно на другое, поэтому при каждой такой подмене
    // нужно переиницилизировать статус
    this.status = this.getStatus();
  }

  ngOnInit(): void {
    this.status = this.getStatus();
  }
}
