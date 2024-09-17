import { ChangeDetectionStrategy, Component, inject, OnInit, ViewChild } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { takeUntil, timer } from 'rxjs';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
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
import { BackButtonComponent } from '../../components/back-button/back-button.component';
import { NzListComponent, NzListItemComponent } from 'ng-zorro-antd/list';
import { LocalStorageService } from '../../services/local-storage.service';

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
    ScrollingModule,
    ReactiveFormsModule,
    BackButtonComponent
  ],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerPage extends BaseComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport, { static: false }) public readonly virtualScroll!: CdkVirtualScrollViewport;

  scrolledIndex: number = 0;

  ParticipantStatus = ParticipantStatus;
  filterForm: FormGroup<FilterForm> = new FormGroup({
    search: new FormControl<string | null>(null),
    status: new FormControl<ParticipantStatus | null>(null)
  });

  participants: Participant[] = [];
  private allParticipants: Participant[] = [];
  isParticipantsLoading: boolean = false;

  filterVisible: boolean = false;

  private readonly router: Router = inject(Router);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  private loadParticipants(): void {
    this.isParticipantsLoading = true;
    this.organizerService.getParticipants()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Participant[]) => {
          this.participants = data;
          this.allParticipants = data;
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();

          this.initScrollPosition();
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении данных об участниках', err);
        }
      });
  }

  private initScrollPosition(): void {
    // Хак для иницилизации виртуал скролла
    timer(300)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const scrollIndex: number = this.localStorageService.getScrollIndex() ?? 0;
        this.scrolledIndex = scrollIndex;
        this.virtualScroll.scrollToIndex(scrollIndex, 'smooth');
        this.cdr.markForCheck();
      });
  }

  private initFilter(): void {
    this.filterForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (value: FilterFormValue) => {
        let initialData: Participant[] = this.allParticipants;

        if (value.search) {
          initialData = initialData.filter((item: Participant) => {
            let search = (<string>value.search).trim().toLowerCase();
            
            return item.code.toLowerCase().includes(search) ||
                  item.info.city.toLowerCase().includes(search) ||
                  item.info.district.toLowerCase().includes(search) ||
                  item.info.name.toLowerCase().includes(search);
          });
        }

        if (value.status) {
          switch (value.status) {
            case ParticipantStatus.InTeam: {
              initialData = initialData.filter((item: Participant) => item.jury?.id);
              break;
            }
            case ParticipantStatus.NotRated: {
              initialData = initialData.filter((item: Participant) => Object.values(item.rates).every((rate: JuryRate | null) => !rate));
              break;
            }
            case ParticipantStatus.FullRated: {
              initialData = initialData.filter((item: Participant) => Object.values(item.rates).every((rate: JuryRate | null) => rate));
              break;
            }
            case ParticipantStatus.PartiallyRated: {
              initialData = initialData.filter((item: Participant) => 
                Object.values(item.rates).some((rate: JuryRate | null) => !rate) &&
                Object.values(item.rates).some((rate: JuryRate | null) => rate));
              break;
            }
          }
        }

        this.participants = initialData;
        this.cdr.markForCheck();
      }
    });
  }

  ngOnInit(): void {
    this.loadParticipants();
    this.initFilter();
  }

  goToJuryPanel(): void {
    this.router.navigate([ORGANIZER_ROOT_PATHS.Adults]);
  }

  trackById(index: number, item: Participant): number {
    return item.id ?? index;
  }

  goToParticipant(id: number): void {
    this.router.navigate([ORGANIZER_ROOT_PATHS.Participant, id]);
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.localStorageService.setScrollIndex(this.scrolledIndex);
  }
}
