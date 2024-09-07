import { Component, inject, OnDestroy } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { Subject } from 'rxjs';

@Component({
  template: '',
})
export class BaseComponent implements OnDestroy {
  protected readonly notificationService: NzNotificationService = inject(
    NzNotificationService
  );
  protected readonly messageService: NzMessageService = inject(NzMessageService);
  protected readonly destroy$: Subject<void> = new Subject<void>();

  ngOnDestroy(): void {
    this.destroy$.unsubscribe();
  }
}
