import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { BaseComponent } from '../base/base.component';
import { ROOT_ROUTE_PATHS } from '../../app.routes';

@Component({
  selector: 'app-main-button',
  standalone: true,
  imports: [NzButtonComponent, NzIconModule],
  templateUrl: './main-button.component.html',
  styleUrl: './main-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainButtonComponent extends BaseComponent {
  private readonly router: Router = inject(Router);

  goToMain(): void {
    this.router.navigate([ROOT_ROUTE_PATHS.Index]);
  }
}
