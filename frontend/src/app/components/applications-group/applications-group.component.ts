import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { BaseComponent } from '../base/base.component';
import { JURY_ROOT_PATHS } from '../../app.routes';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';
import { NzButtonComponent } from 'ng-zorro-antd/button';

@Component({
  selector: 'app-applications-group',
  standalone: true,
  imports: [NzTypographyComponent, RouterLink, NzButtonComponent],
  templateUrl: './applications-group.component.html',
  styleUrl: './applications-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsGroupComponent extends BaseComponent {
  @Input({ required: true }) title!: string;
  @Input({ required: true }) participants!: AnonymousParticipant[];

  applicationPath: string = JURY_ROOT_PATHS.Application;
}
