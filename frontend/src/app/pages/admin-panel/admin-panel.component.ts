import { Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, Observable, of, startWith } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { ADMIN_ROOT_PATHS, ROOT_ROUTE_PATHS } from '../../app.routes';
import { Participant } from '../../models/participant';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { FilterForm, FilterFormValue, mockData, ParticipantStatus, ViewType } from './admin-panel';

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
    this.router.navigate([ROOT_ROUTE_PATHS.AdminPanel, ADMIN_ROOT_PATHS.Jury]);
  }

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }

  goToParticipant(id: number): void {
    this.router.navigate([ROOT_ROUTE_PATHS.AdminPanel, ADMIN_ROOT_PATHS.Participant, id]);
  }

  changeViewType(): void {
    this.viewType = this.viewType === ViewType.Grid ? ViewType.List : ViewType.Grid;
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }
}
