import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { JuriScore, Participant } from '../../models/participant';
import { ROUTE_PATHS } from '../../app.routes';
import { debounceTime, map, Observable, of, startWith } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';

enum ViewType {
  Grid = 'grid',
  List = 'list'
};

enum ParticipantStatus {
  Evaluated = 'evaluated',
  NotEvaluated = 'not-evaluated',
  InTeam = 'in-team'
}

const mockData: Participant[] = Array.from({ length: 50 }, (_, index) => {
  return {
    id: index + 1,
    info: {
      name: "Петроуговен Абдулагбек Чингызханович" + ' ' + Math.random().toFixed(4),
      photoUrl: "https://kartinki.pics/pics/uploads/posts/2022-09/1662615787_1-kartinkin-net-p-milie-kotiki-v-shapochkakh-instagram-1.jpg",
      location: "г. Подзалупинск-на-Каказе" + ' ' + Math.random().toFixed(5),
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

type FilterForm = {
  search: FormControl<string | null>,
  status: FormControl<ParticipantStatus | null>
}

type FilterFormValue = {
  search?: string | null,
  status?: ParticipantStatus | null
}

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
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    NzPopoverDirective,
    NzRadioGroupComponent,
    NzRadioComponent
  ],
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.scss']
})
export class AdminPanelPage {
  viewType: ViewType = ViewType.Grid;
  ViewType = ViewType;

  filterForm: FormGroup<FilterForm> = new FormGroup({
    search: new FormControl<string | null>(null),
    status: new FormControl<ParticipantStatus | null>(null)
  });

  ParticipantStatus = ParticipantStatus;

  participants$: Observable<Participant[]> = this.filterForm.valueChanges.pipe(
    debounceTime(150),
    map((value: FilterFormValue | null) => {
      if (!value) {
        return mockData;
      }

      let filteredData: Participant[] = mockData.slice(0, mockData.length - 1);

      if (value.search) {
        filteredData = filteredData.filter((item: Participant) => 
            item.info?.name?.includes(<string>value.search) || item.info?.location?.includes(<string>value.search));
      }

      if (value.status) {
        switch (value.status) {
          case ParticipantStatus.Evaluated: {
            filteredData = filteredData.filter((item: Participant) => Object.keys(item.scores).length > 0);
            break;
          }
          case ParticipantStatus.NotEvaluated: {
            filteredData = filteredData.filter((item: Participant) => Object.keys(item.scores).length === 0);
            break;
          }
          case ParticipantStatus.InTeam: {
            break;
          }
        }
      }

      return filteredData;
    }),
    startWith(mockData),
  );

  filterVisible: boolean = false;

  private readonly router: Router = inject(Router);

  goToJuryPanel(): void {
    this.router.navigate([ROUTE_PATHS.JuryPanel]);
  }

  goToLogin(): void {
    this.router.navigate([ROUTE_PATHS.Login]);
  }

  changeViewType(): void {
    this.viewType = this.viewType === ViewType.Grid ? ViewType.List : ViewType.Grid;
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }
  
}
