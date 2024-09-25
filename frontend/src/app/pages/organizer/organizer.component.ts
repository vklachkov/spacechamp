import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, delay, takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ORGANIZER_ROOT_PATHS } from '../../app.routes';
import { JuryRate, Participant } from '../../models/api/participant.interface';
import { OrganizerService } from '../../services/organizer.service';
import { BaseComponent } from '../../components/base/base.component';
import { ParticipantCardComponent } from '../../components/participant-card/participant-card.component';
import { ParticipantStatus } from '../../models/participant-status.enum';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { LogoutButtonComponent } from '../../components/logout-button/logout-button.component';
import { HeaderComponent } from '../../components/header/header.component';
import { Order } from '../../models/api/order.enum';
import { Sort } from '../../models/api/sort.enum';

type FilterForm = {
  search: FormControl<string | null>;
  status: FormControl<ParticipantStatus | null>;
};

type FilterFormValue = {
  search?: string | null;
  status?: ParticipantStatus | null;
};

@Component({
  selector: 'app-organizer-page',
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
    NzPopoverDirective,
    NzRadioComponent,
    NzRadioGroupComponent,
    NzSpinComponent,
    ParticipantCardComponent,
    AsyncPipe,
    FormsModule,
    NzListComponent,
    NzListItemComponent,
    ReactiveFormsModule,
    LogoutButtonComponent,
    HeaderComponent
  ],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerPage extends BaseComponent implements OnInit {
  ParticipantStatus = ParticipantStatus;
  filterForm: FormGroup<FilterForm> = new FormGroup({
    search: new FormControl<string | null>(null),
    status: new FormControl<ParticipantStatus | null>(null)
  });

  participants: Participant[] = [];
  isParticipantsLoading: boolean = false;

  filterVisible: boolean = false;

  private readonly router: Router = inject(Router);
  private readonly organizerService: OrganizerService = inject(OrganizerService);

  private loadParticipants(order: Order, sort: Sort, search?: string | null): void {
    this.isParticipantsLoading = true;
    this.cdr.markForCheck();

    this.organizerService.getParticipants(order, sort, search)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Participant[]) => {
          this.participants = this.filterByStatus(data);
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении данных об участниках', err);
        }
      });
  }

  private filterByStatus(participants: Participant[]): Participant[] {
    if (!this.filterForm.value.status) {
      return participants;
    }

    switch (this.filterForm.value.status) {
      case ParticipantStatus.InTeam: {
        return participants.filter((item: Participant) => item.jury);
      }
      case ParticipantStatus.NotRated: {
        return participants.filter((item: Participant) => Object.values(item.rates).every((rate: JuryRate | null) => !rate));
      }
      case ParticipantStatus.FullRated: {
        return participants.filter((item: Participant) => !item.jury && Object.values(item.rates).every((rate: JuryRate | null) => rate));
      }
      case ParticipantStatus.PartiallyRated: {
        return participants.filter((item: Participant) => 
          Object.values(item.rates).some((rate: JuryRate | null) => !rate) &&
          Object.values(item.rates).some((rate: JuryRate | null) => rate));
      }
    }
  }

  private initFilter(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), 
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (value: FilterFormValue) => {
          this.loadParticipants(Order.DESC, Sort.Id, value.search);
        }
      });
  }

  ngOnInit(): void {
    this.loadParticipants(Order.DESC, Sort.Id);
    this.initFilter();
  }

  goToJuryPanel(): void {
    this.router.navigate([ORGANIZER_ROOT_PATHS.Adults]);
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
  }
}
