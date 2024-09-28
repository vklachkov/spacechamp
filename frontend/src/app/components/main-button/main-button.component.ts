import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { BaseComponent } from '@components/base/base.component';
import { NavigationService } from '@services/navigation.service';

@Component({
  selector: 'app-main-button',
  standalone: true,
  imports: [NzButtonComponent, NzIconModule],
  templateUrl: './main-button.component.html',
  styleUrl: './main-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainButtonComponent extends BaseComponent {
  private readonly navigationService: NavigationService = inject(NavigationService);

  goToMain(): void {
    this.navigationService.back(ROOT_ROUTE_PATHS.Index);
  }
}
