import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { KnownParticipantCardComponent } from './components/known-participant-card/known-participant-card.component';
import { Participant } from './models/participant';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterOutlet,
    NzLayoutModule,
    NzButtonComponent,
    NzIconModule,
    NzInputModule,
    NzFlexModule,
    KnownParticipantCardComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  participants: Participant[] = Array.from({ length: 1000 }, (_, index) => {
    return {
      id: index,
      info: {
        name: "Петроуговен Абдулагбек Чингызханович",
        photoUrl: "https://kartinki.pics/pics/uploads/posts/2022-09/1662615787_1-kartinkin-net-p-milie-kotiki-v-shapochkakh-instagram-1.jpg",
        location: "г. Подзалупинск-на-Каказе",
        phoneNumber: "+7-999-555-35-35",
        email: "test@mail.ru",
        org: "МОУ СОШ №1",
      },
      answers: {}
    };
  });
}
