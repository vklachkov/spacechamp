import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, takeUntil } from 'rxjs';
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
import { ParticipantsQuery } from '../../models/participants-query.interface';
import { BindQueryParamsFactory, BindQueryParamsManager } from '@ngneat/bind-query-params';

type FilterForm = {
  search: FormControl<string | null>;
  status: FormControl<ParticipantStatus | null>;
  sort: FormControl<Sort | null>;
  order: FormControl<Order | null>;
};

type FilterFormValue = {
  search?: string | null;
  status?: ParticipantStatus | null;
  sort?: Sort | null;
  order?: Order | null;
}

const DEFAULT_SORT: Sort = Sort.Id;
const DEFAULT_ORDER: Order = Order.DESC;

const ASC_SORT_NUMERIC_LABEL: string = 'От старых к новым';
const DESC_SORT_NUMBERIC_LABEL: string = 'От новых к старым';
const ASC_SORT_LETTER_LABEL: string = 'От А до Я';
const DESC_SORT_LETTER_LABEL: string = 'От Я до А';

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
export class OrganizerPage extends BaseComponent implements OnInit, OnDestroy {
  ParticipantStatus = ParticipantStatus;
  Sort = Sort;
  Order = Order;
  filterForm: FormGroup<FilterForm> = new FormGroup({
    search: new FormControl<string | null>(null),
    status: new FormControl<ParticipantStatus | null>(null),
    sort: new FormControl<Sort | null>(DEFAULT_SORT),
    order: new FormControl<Order | null>(DEFAULT_ORDER),
  });

  participants: Participant[] = [];
  isParticipantsLoading: boolean = false;

  filterVisible: boolean = false;

  ascSortLabel: string = '';
  descSortLabel: string = '';

  isDownloadingReport: boolean = false;

  private readonly router: Router = inject(Router);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly queryManager: BindQueryParamsFactory = inject(BindQueryParamsFactory);

  private bindQueryParamsManager: BindQueryParamsManager<FilterFormValue> = this.queryManager.create<FilterFormValue>([
    {
      queryKey: 'order',
      type: 'string',
      syncInitialControlValue: false,
      syncInitialQueryParamValue: true
    },
    {
      queryKey: 'sort',
      type: 'string',
      syncInitialControlValue: false,
      syncInitialQueryParamValue: true
    },
    {
      queryKey: 'search',
      type: 'string',
      syncInitialControlValue: false,
      syncInitialQueryParamValue: true
    },
    {
      queryKey: 'status',
      type: 'string',
      syncInitialControlValue: false,
      syncInitialQueryParamValue: true
    }
  ]).connect(this.filterForm);

  private loadParticipants(): void {
    this.isParticipantsLoading = true;
    this.cdr.markForCheck();

    const query: ParticipantsQuery = this.buildQuery();
    this.organizerService.getParticipants(query)
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

  private buildQuery(): ParticipantsQuery {
    return {
      sort: this.filterForm.value.sort ?? DEFAULT_SORT,
      order: this.filterForm.value.order ?? DEFAULT_ORDER,
      search: this.filterForm.value.search
    }
  }

  private initFilterFormSubscription(): void {
    this.filterForm.valueChanges
      .pipe(
        debounceTime(300), 
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.loadParticipants();
        }
      });
  }

  private setSortLabels(sort: Sort): void {
    switch (sort) {
      case Sort.Id: {
        this.ascSortLabel = ASC_SORT_NUMERIC_LABEL;
        this.descSortLabel = DESC_SORT_NUMBERIC_LABEL;
        break;
      }
      case Sort.City:
      case Sort.District:
      case Sort.Name: {
        this.ascSortLabel = ASC_SORT_LETTER_LABEL;
        this.descSortLabel = DESC_SORT_LETTER_LABEL;
        break;
      }
    }
  }

  private initSortControlSubscription(): void {
    this.filterForm.get('sort')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (value: Sort | null) => {
          if (!value) {
            return;
          }

          this.setSortLabels(value);
        }
      });
  }

  private initSortLabels(): void {
    const sort: FilterFormValue['sort'] = this.filterForm.value.sort;

    if (!sort) {
      return;
    }

    this.setSortLabels(sort);
  }

  ngOnInit(): void {
    this.initSortLabels();
    this.loadParticipants();
    this.initFilterFormSubscription();
    this.initSortControlSubscription();
  }

  goToJuryPanel(): void {
    this.router.navigate([ORGANIZER_ROOT_PATHS.Adults]);
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }

  getReport(): void {
    this.isDownloadingReport = true;
    this.cdr.markForCheck();
  
    this.organizerService.getParticipantsReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pdf) => {
          // TODO: Обобщить с DownloadService
          // TODO: Удалить <a>
          const blob = new Blob([pdf], {type: 'application/pdf'});
          const link = document.createElement("a");
          link.href = window.URL.createObjectURL(blob);
          link.style.display = 'none';
          link.download = 'Отчёт_Кандидаты_КЧ.pdf';
          link.click();
          
          this.isDownloadingReport = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isDownloadingReport = false;
          this.cdr.markForCheck();

          this.showErrorNotification('Внутренняя ошибка при генерации отчёта', err);
        }
      });
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.bindQueryParamsManager.destroy();
  }
}
