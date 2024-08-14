import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';

@Component({
  selector: 'KnownParticipantCard',
  standalone: true,
  imports: [NzCardModule],
  templateUrl: './known-participant-card.component.html',
  styleUrl: './known-participant-card.component.scss'
})
export class KnownParticipantCardComponent {

}
