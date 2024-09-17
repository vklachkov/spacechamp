import { Component, Input, OnInit } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { JuryRate, Participant } from '../../models/api/participant.interface';
import { ParticipantStatus } from '../../models/participant-status.enum';


@Component({
  selector: 'app-participant-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzAvatarModule],
  templateUrl: './participant-card.component.html',
  styleUrl: './participant-card.component.scss'
})
export class ParticipantCardComponent implements OnInit {
  @Input({ required: true }) public participant!: Participant;

  status!: ParticipantStatus;
  ParticipantStatus = ParticipantStatus;

  private getStatus(): ParticipantStatus {
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

    return ParticipantStatus.InTeam;
  }

  ngOnInit(): void {
    this.status = this.getStatus();
  }
}
