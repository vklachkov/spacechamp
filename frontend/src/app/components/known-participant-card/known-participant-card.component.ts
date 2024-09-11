import { Component, Input, OnInit } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { JuryRate, Participant } from '../../models/api/participant.interface';
import { View } from '../../models/view.enum';
import { ParticipantStatus } from '../../models/participant-status.enum';
import { Adult } from '../../models/api/adult.interface';


@Component({
  selector: 'app-known-participant-card',
  standalone: true,
  imports: [CommonModule, NzCardModule, NzAvatarModule],
  templateUrl: './known-participant-card.component.html',
  styleUrl: './known-participant-card.component.scss'
})
export class KnownParticipantCardComponent implements OnInit {
  @Input({ required: true }) public participant!: Participant;
  @Input({ required: true }) public view!: View;

  status!: ParticipantStatus;
  ParticipantStatus = ParticipantStatus;

  View = View;

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
