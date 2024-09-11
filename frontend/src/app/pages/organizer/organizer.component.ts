import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map, Observable, of, startWith, takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzPopoverDirective } from 'ng-zorro-antd/popover';
import { NzRadioComponent, NzRadioGroupComponent } from 'ng-zorro-antd/radio';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ORGANIZER_ROOT_PATHS, ROOT_ROUTE_PATHS } from '../../app.routes';
import { JuryRate, Participant } from '../../models/api/participant.interface';
import { KnownParticipantCardComponent } from '../../components/known-participant-card/known-participant-card.component';
import { OrganizerService } from '../../services/organizer.service';
import { BaseComponent } from '../../components/base/base.component';
import { View } from '../../models/view.enum';
import { ParticipantStatus } from '../../models/participant-status.enum';
import { AuthService } from '../../services/auth.service';
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
    KnownParticipantCardComponent,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './organizer.component.html',
  styleUrls: ['./organizer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerPage extends BaseComponent implements OnInit {
  view: View = View.Grid;
  View = View;

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
  private readonly authService: AuthService = inject(AuthService);

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
        },
        error: (err: HttpErrorResponse) => {
          this.isParticipantsLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении данных об участниках', err);
        }
      });
  }

  private initFilter(): void {
    this.filterForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (value: FilterFormValue) => {
        let initialData: Participant[] = this.allParticipants;

        if (value.search) {
          initialData = initialData.filter((item: Participant) => 
            item.info.city.toLowerCase().includes((<string>value.search).trim().toLowerCase()) ||
            item.info.district.toLowerCase().includes((<string>value.search).trim().toLowerCase()) ||
            item.info.name.toLowerCase().includes((<string>value.search).trim().toLowerCase())
          )
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
              initialData = initialData.filter((item: Participant) => Object.values(item.rates).some((rate: JuryRate | null) => rate));
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
    this.router.navigate([ORGANIZER_ROOT_PATHS.Jury]);
  }

  goToLogin(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.localStorageService.clearAuthData();
          this.router.navigate([ROOT_ROUTE_PATHS.Login]);
        },
        error: (err: HttpErrorResponse) => {
          this.showErrorNotification('Ошибка при выходе', err);
        }
      });
  }

  goToParticipant(id: number): void {
    this.router.navigate([ORGANIZER_ROOT_PATHS.Participant, id]);
  }

  changeViewType(): void {
    this.view = this.view === View.Grid ? View.List : View.Grid;
  }

  changeFilterVisible(value: boolean): void {
    this.filterVisible = value;
  }
}
