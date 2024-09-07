import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { Jury } from '../../../../models/jury';
import { mockData } from './organizer-jury';
import { JuryCardComponent } from '../../../../components/jury-card/jury-card.component';
import { AddJuryModalComponent } from '../../../../components/add-jury-modal/add-jury-modal.component';
import { BaseComponent } from '../../../../components/base/base.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzIconModule,
    AsyncPipe,
    JuryCardComponent
  ],
  providers: [NzModalService],
  templateUrl: './organizer-jury.component.html',
  styleUrls: ['./organizer-jury.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerJuryPage extends BaseComponent {
  jury$: BehaviorSubject<Jury[]> = new BehaviorSubject<Jury[]>(mockData);
 
  private readonly router: Router = inject(Router);
  private readonly modalService: NzModalService = inject(NzModalService);

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }

  removeJury(id: number): void {
    const newJury: Jury[] = this.jury$.value.filter((item: Jury) => item.id !== id);
    this.jury$.next(newJury);
  }

  openAddModal(): void {
    this.modalService.create<AddJuryModalComponent, undefined, Omit<Jury, 'id'>>({
      nzTitle: 'Новый аккаунт',
      nzContent: AddJuryModalComponent,
    }).afterClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          return;
        }
        const allJury: Jury[] = this.jury$.value;
        allJury.unshift({
          id: allJury.length + 1,
          ...data
        });
        this.jury$.next(allJury);
      });
  }
}
