import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { JuriScore, Participant } from '../../models/participant';

@Component({
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
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelPage {
  participants: Participant[] = Array.from({ length: 50 }, (_, index) => {
    return {
      id: index + 1,
      info: {
        name: "Петроуговен Абдулагбек Чингызханович",
        photoUrl: "https://kartinki.pics/pics/uploads/posts/2022-09/1662615787_1-kartinkin-net-p-milie-kotiki-v-shapochkakh-instagram-1.jpg",
        location: "г. Подзалупинск-на-Каказе",
        phoneNumber: "+7-999-555-35-35",
        email: "test@mail.ru",
        org: "МОУ СОШ №1",
      },
      answers: {},
      scores: index % 9 !== 0
        ? <Record<number, JuriScore>>{ 1: { rate: 4, comment: "Норм участник" } }
        : <Record<number, JuriScore>>{ },
    };
  });

  viewType: 'grid' | 'list' = 'grid';
}
