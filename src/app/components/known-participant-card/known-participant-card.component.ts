import { Component, input } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Participant } from '../../models/participant';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';

@Component({
  selector: 'KnownParticipantCard',
  standalone: true,
  imports: [NzCardModule, NzAvatarModule],
  templateUrl: './known-participant-card.component.html',
  styleUrl: './known-participant-card.component.scss'
})
export class KnownParticipantCardComponent {
  participant = input.required<Participant>();
}
