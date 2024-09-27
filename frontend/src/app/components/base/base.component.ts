import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';

@Component({
  template: '',
})
export class BaseComponent implements OnDestroy {
  protected readonly notificationService: NzNotificationService = inject(
    NzNotificationService
  );
  protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected readonly messageService: NzMessageService = inject(NzMessageService);
  protected readonly destroy$: Subject<void> = new Subject<void>();

  showErrorNotification(notificationTitle: string, err: HttpErrorResponse): void {
    this.notificationService.error('Ошибка', err.message ?? notificationTitle);
    console.error(`${notificationTitle}: `, err);
  }

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }
}
