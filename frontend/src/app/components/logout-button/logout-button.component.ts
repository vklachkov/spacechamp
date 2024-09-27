import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntil } from 'rxjs';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { BaseComponent } from '@components/base/base.component';
import { LocalStorageService } from '@services/local-storage.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-logout-button',
  standalone: true,
  imports: [NzButtonComponent, NzIconModule],
  templateUrl: './logout-button.component.html',
  styleUrl: './logout-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoutButtonComponent extends BaseComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);

  goToLogin(): void {
    this.authService.logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.localStorageService.clearData();
          this.router.navigate([ROOT_ROUTE_PATHS.Login]);
        },
        error: (err: HttpErrorResponse) => {
          this.showErrorNotification('Ошибка при выходе', err);
        }
      });
  }
}
