import { Component, Input } from '@angular/core';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzCardModule } from 'ng-zorro-antd/card';
import { Participant } from '../../models/participant';
import { ViewType } from '../../pages/organizer/organizer';

@Component({
  selector: 'app-known-participant-card',
  standalone: true,
  imports: [NzCardModule, NzAvatarModule],
  templateUrl: './known-participant-card.component.html',
  styleUrl: './known-participant-card.component.scss'
})
export class KnownParticipantCardComponent {
  @Input({ required: true }) public participant!: Participant;
  @Input({ required: true }) public viewType!: ViewType;

  ViewType = ViewType;
}
