
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot } from '@angular/router';
import { Observable, take } from 'rxjs';
import { inject, Injectable } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

export interface BlockNavigationIfChange {
  hasChanges: () => boolean;
}

// TODO: canDeactive на функцию можна переписать?
@Injectable({ providedIn: 'root' })
export class CanDeactivateBlockNavigationIfChange<T extends BlockNavigationIfChange> implements CanDeactivate<T> {
  private readonly nzModalService: NzModalService = inject(NzModalService);

  canDeactivate(component: T, route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return new Observable<boolean>((observer) => {
      const deactivate = (canDeactivate: boolean) => {
        observer.next(canDeactivate);
        observer.complete();
      };
      
      if (!component.hasChanges()) {
        return deactivate(true);
      }
      
      this.nzModalService.confirm({
        nzTitle: "Данные изменены",
        nzContent: "Вы уверены, что хотите уйти со страницы без сохранения изменений?",
        nzOkDanger: true,
        nzOnCancel: () => deactivate(false),
        nzOnOk: () => deactivate(true),
      });
    });
  }
}
