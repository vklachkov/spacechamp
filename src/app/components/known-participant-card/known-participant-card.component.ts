import { Component, input } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Participant } from '../../models/participant';

@Component({
  selector: 'app-known-participant-card',
  standalone: true,
  imports: [NzCardModule, NzAvatarModule],
  templateUrl: './known-participant-card.component.html',
  styleUrl: './known-participant-card.component.scss'
})
export class KnownParticipantCardComponent {
  participant = input.required<Participant>();
}
