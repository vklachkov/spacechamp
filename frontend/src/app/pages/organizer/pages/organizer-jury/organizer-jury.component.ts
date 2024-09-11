import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { EMPTY, switchMap, takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { Adult } from '../../../../models/api/adult.interface';
import { JuryCardComponent } from '../../../../components/jury-card/jury-card.component';
import { AddJuryModalComponent } from '../../../../components/add-jury-modal/add-jury-modal.component';
import { BaseComponent } from '../../../../components/base/base.component';
import { OrganizerService } from '../../../../services/organizer.service';
import { AuthService } from '../../../../services/auth.service';
import { LocalStorageService } from '../../../../services/local-storage.service';

// TODO: название не jury, а adult
@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzIconModule,
    NzSpinComponent,
    AsyncPipe,
    JuryCardComponent
  ],
  providers: [NzModalService],
  templateUrl: './organizer-jury.component.html',
  styleUrls: ['./organizer-jury.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerJuryPage extends BaseComponent implements OnInit {
  adults: Adult[] = []; 
  isAdultsLoading: boolean = false;
 
  private readonly router: Router = inject(Router);
  private readonly modalService: NzModalService = inject(NzModalService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly organizerService: OrganizerService = inject(OrganizerService);
  private readonly authService: AuthService = inject(AuthService);

  private loadAdults(): void {
    this.isAdultsLoading = true;
    this.organizerService.getAdults()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Adult[]) => {
          this.adults = data;
          this.isAdultsLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isAdultsLoading = false;
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при получении данных о жюри и организаторах', err);
        }
      });
  }

  ngOnInit(): void {
    this.loadAdults();
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

  // TODO: проверить после доработки бэка
  removeAdult(id: number): void {
    this.isAdultsLoading = true;
    this.organizerService.deleteAdult(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadAdults();
        },
        error: (err: HttpErrorResponse) => {
          this.isAdultsLoading = false;
          this.showErrorNotification('Ошибка при удалении жюри или организатора', err);
          this.cdr.markForCheck();
        }
      })

    this.adults = this.adults.filter((item: Adult) => item.id !== id);
  }

  openAddModal(): void {
    this.modalService.create<AddJuryModalComponent, undefined, Omit<Adult, 'id'>>({
      nzTitle: 'Новый аккаунт',
      nzContent: AddJuryModalComponent,
    }).afterClose
      .pipe(
        switchMap((data: Omit<Adult, 'id'> | undefined) => {
          if (!data) {
            return EMPTY;
          }

          this.isAdultsLoading = true;
          this.cdr.markForCheck();
          return this.organizerService.createAdult(data);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: () => {
          this.loadAdults();
        },
        error: (err: HttpErrorResponse) => {
          this.isAdultsLoading = false;
          this.showErrorNotification('Ошибка при добавлении жюри или организатора', err);
          this.cdr.markForCheck();
        }
      });
  }
}
