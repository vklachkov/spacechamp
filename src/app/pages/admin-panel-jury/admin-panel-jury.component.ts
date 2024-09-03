import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { Jury } from '../../models/jury';
import { mockData } from './admin-panel-jury';
import { JuryCardComponent } from '../../components/jury-card/jury-card.component';
import { AddJuryModalComponent } from '../../components/add-jury-modal/add-jury-modal.component';

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
  templateUrl: './admin-panel-jury.component.html',
  styleUrls: ['./admin-panel-jury.component.scss']
})
export class AdminPanelJuryPage {
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
      nzTitle: 'Новый гондурас',
      nzContent: AddJuryModalComponent,
    }).afterClose.subscribe(data => {
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
