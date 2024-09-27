import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { EMPTY, switchMap, takeUntil } from 'rxjs';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { BaseComponent } from '@components/base/base.component';
import { AddAdultModalComponent } from '@components/add-adult-modal/add-adult-modal.component';
import { AdultCardComponent } from '@components/adult-card/adult-card.component';
import { MainButtonComponent } from '@components/main-button/main-button.component';
import { LogoutButtonComponent } from '@components/logout-button/logout-button.component';
import { HeaderComponent } from '@components/header/header.component';
import { OrganizerService } from '@services/organizer.service';
import { Adult } from '@models/api/adult.interface';

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
    HeaderComponent,
    AdultCardComponent,
    LogoutButtonComponent,
    MainButtonComponent,
  ],
  templateUrl: './organizer-adults.component.html',
  styleUrls: ['./organizer-adults.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerAdultsPage extends BaseComponent implements OnInit {
  adults: Adult[] = []; 
  isAdultsLoading: boolean = false;

  private readonly modalService: NzModalService = inject(NzModalService);
  private readonly organizerService: OrganizerService = inject(OrganizerService);

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
      });
  }

  openAddModal(): void {
    this.modalService.create<AddAdultModalComponent, undefined, Omit<Adult, 'id'>>({
      nzTitle: 'Новый аккаунт',
      nzContent: AddAdultModalComponent,
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
          this.cdr.markForCheck();
          this.showErrorNotification('Ошибка при добавлении жюри или организатора', err);
        }
      });
  }
}
