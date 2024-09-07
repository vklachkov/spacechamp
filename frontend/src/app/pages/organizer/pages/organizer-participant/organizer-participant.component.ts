import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { map, Observable, of, switchMap } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../../../app.routes';
import { Participant } from '../../../../models/participant';
import { mockData } from './organizer-participant';
import { NzTabComponent, NzTabSetComponent } from 'ng-zorro-antd/tabs';
import { NzCardComponent } from 'ng-zorro-antd/card';
import { NzAvatarComponent } from 'ng-zorro-antd/avatar';
import { NzOptionComponent, NzSelectComponent } from 'ng-zorro-antd/select';
import { Jury } from '../../../../models/jury';
import { mockData as mockJury } from '../../../organizer/pages/organizer-jury/organizer-jury';
import { NzTableModule } from 'ng-zorro-antd/table';

interface TableData {
  name: string, 
  salary: number, 
  comment: string
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzLayoutModule,
    NzTypographyComponent,
    NzButtonComponent,
    NzTabSetComponent,
    NzTabComponent,
    NzCardComponent,
    NzAvatarComponent,
    NzIconModule,
    NzSelectComponent,
    NzOptionComponent,
    NzTableModule,
    AsyncPipe,
  ],
  templateUrl: './organizer-participant.component.html',
  styleUrls: ['./organizer-participant.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrganizerParticipantPage implements OnInit { 
  private readonly router: Router = inject(Router);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  participant$!: Observable<Participant | null>;

  allJury: Jury[] = mockJury;
  tableData$!: Observable<TableData[]>;

  ngOnInit(): void {
    this.participant$ = this.activatedRoute.paramMap
      .pipe(
        switchMap((params: ParamMap) => {
          const id: string | null = params.get('id');

          if (!id) {
            return of(null);
          }

          return of(mockData);
        })
      );

    this.tableData$ = this.participant$.pipe(map((item: Participant | null) => {
      if (!item) {
        return [];
      }

      const data: TableData[] = [];

      Object.entries(item.scores).forEach(([juryId, value]) => {
        data.push({
          name: this.allJury.find((jury: Jury) => jury.id === +juryId)?.name ?? '',
          salary: value.salary,
          comment: value.comment
        });
      });

      return data;
    }))
  }

  goToLogin(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Login]);
  }

}
