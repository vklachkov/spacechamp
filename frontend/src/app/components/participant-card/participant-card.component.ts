import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { ORGANIZER_ROOT_PATHS } from '../../app.routes';
import { JuryRate, Participant } from '@models/api/participant.interface';
import { ParticipantStatus } from '@models/participant-status.enum';

@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzAvatarModule, RouterLink],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantCardComponent implements OnInit {
  @Input({ required: true }) participant!: Participant;

  status: ParticipantStatus | null = null;
  ParticipantStatus = ParticipantStatus;

  participantPath: string = ORGANIZER_ROOT_PATHS.Participant;

  text: string = '';

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

  private buildText(): void {
    const text: string[] = [`г. ${this.participant.info.city}`, this.participant.info.edu_org];
    if (this.participant.info.responsible_adult_name) {
      text.push(this.participant.info.responsible_adult_name);
    }

    this.text = text.join(', ');
  }

  ngOnInit(): void {
    this.status = this.getStatus();
    this.buildText();
  }
}
