import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Observable, of, switchMap, takeUntil } from 'rxjs';
import { JuriScore, Participant } from '../../models/participant';
import { mockData } from './jury-panel-application';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BaseComponent } from '../../components/base/base.component';
import { EvaluateApplicationModalComponent } from '../../components/evaluate-application-modal/evaluate-application-modal.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzIconModule,
    AsyncPipe,
  ],
  providers: [NzModalService],
  templateUrl: './jury-panel-application.component.html',
  styleUrls: ['./jury-panel-application.component.scss']
})
export class JuryPanelApplicationPage extends BaseComponent {
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly modalService: NzModalService = inject(NzModalService);

  application$!: Observable<Participant | null>;

  ngOnInit(): void {
    this.application$ = this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          return of(mockData);
        })
      );
  }

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }

  openEvaluateModal(): void {
    this.modalService.create<EvaluateApplicationModalComponent, undefined, JuriScore>({
      nzTitle: 'Новый неизвестный гондурас',
      nzContent: EvaluateApplicationModalComponent,
    }).afterClose
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        if (!data) {
          return;
        }
        
        console.warn(data, 'data');
      });
  }
}
