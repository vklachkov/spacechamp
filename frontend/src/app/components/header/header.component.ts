import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzColDirective, NzRowDirective } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    NzButtonComponent,
    NzIconModule,
    NzTypographyComponent,
    NzRowDirective,
    NzColDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  // changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeaderComponent {
}
