import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { JURY_ROOT_PATHS } from '../../app.routes';
import { BaseComponent } from '@components/base/base.component';
import { JuryParticipant } from '@models/api/jury-participant.interface';

@Component({
  selector: 'app-applications-group',
  standalone: true,
  imports: [NzTypographyComponent, RouterLink, NzButtonComponent],
  templateUrl: './applications-group.component.html',
  styleUrl: './applications-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApplicationsGroupComponent extends BaseComponent {
  protected readonly applicationPath: string = JURY_ROOT_PATHS.Application;
  
  @Input({ required: true }) title!: string;
  @Input({ required: true }) participants!: JuryParticipant[];
}
