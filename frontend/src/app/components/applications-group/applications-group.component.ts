import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BaseComponent } from '../base/base.component';
import { JURY_ROOT_PATHS } from '../../app.routes';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';

@Component({
  selector: 'app-applications-group',
  standalone: true,
  imports: [NzTypographyComponent],
  templateUrl: './applications-group.component.html',
  styleUrl: './applications-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsGroupComponent extends BaseComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) participants!: AnonymousParticipant[];

  private readonly router: Router = inject(Router);

  goToApplication(id: number): void {
    this.router.navigate([JURY_ROOT_PATHS.Application, id]);
  }
}
