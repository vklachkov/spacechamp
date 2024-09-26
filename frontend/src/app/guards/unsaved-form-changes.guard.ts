
import { CanDeactivateFn } from '@angular/router';
import { Observable, Subscriber } from 'rxjs';
import { inject } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';
import { OrganizerParticipantPage } from '../pages/organizer/pages/organizer-participant/organizer-participant.component';

export function unsavedFormChangesGuard(): CanDeactivateFn<OrganizerParticipantPage> {
  return (component: OrganizerParticipantPage) => {
    const nzModalService: NzModalService = inject(NzModalService);
    
    return new Observable<boolean>((observer: Subscriber<boolean>) => {
      if (!component.formHasChanges()) {
        observer.next(true);
        observer.complete();
        return;
      }
      
      nzModalService.confirm({
        nzTitle: "Данные изменены",
        nzContent: "Вы уверены, что хотите уйти со страницы без сохранения изменений?",
        nzOkDanger: true,
        nzOnCancel: () => {
          observer.next(false);
          observer.complete();
        },
        nzOnOk: () => {
          observer.next(true);
          observer.complete();
        },
      });
    });
  };
}
