import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { LoginInput } from '../../models/api/login-input.interface';
import { LoginOutput } from '../../models/api/login-output.interface';
import { AuthService } from '../../services/auth.service';
import { LocalStorageService } from '../../services/local-storage.service';
import { BaseComponent } from '../../components/base/base.component';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzButtonComponent,
    NzTypographyComponent,
    NzSpinComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginPage extends BaseComponent {
  form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required])
  });
  isLoginLoading: boolean = false;

  private readonly authService: AuthService = inject(AuthService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);

  login(): void {
    const data: LoginInput = <LoginInput>this.form.value;

    this.isLoginLoading = true;
    this.authService.login(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loginData: LoginOutput) => {
          this.localStorageService.setAuthData(loginData);
          this.router.navigate([ROOT_ROUTE_PATHS.Index]);
          this.isLoginLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoginLoading = false;
          this.notificationService.error('Ошибка', err.message ?? 'Ошибка при логине');
          console.error('Ошибка при логине: ', err);
          this.cdr.markForCheck();
        }
      })

  }
}
