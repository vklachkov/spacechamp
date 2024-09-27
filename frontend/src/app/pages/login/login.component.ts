import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSpinComponent } from 'ng-zorro-antd/spin';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { BaseComponent } from '@components/base/base.component';
import { AuthService } from '@services/auth.service';
import { LocalStorageService } from '@services/local-storage.service';
import { LoginInput } from '@models/api/login-input.interface';
import { Adult } from '@models/api/adult.interface';

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
    NzIconModule,
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
  isPasswordVisible: boolean = false;

  private readonly authService: AuthService = inject(AuthService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);

  login(): void {
    const formValue: LoginInput = <LoginInput>this.form.value;

    const data: LoginInput = {
      ...formValue,
      name: formValue.name.trim() ?? ''
    };

    this.isLoginLoading = true;
    this.authService.login(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: Adult) => {
          this.localStorageService.setAuthData(data);
          this.router.navigate([ROOT_ROUTE_PATHS.Index]);
          this.isLoginLoading = false;
          this.cdr.markForCheck();
        },
        error: (err: HttpErrorResponse) => {
          this.isLoginLoading = false;

          const errorMessage: string = err.status === HttpStatusCode.Unauthorized
            ? 'Неправильный логин или пароль'
            :  err.message ?? 'Ошибка при логине';

          this.notificationService.error('Ошибка', errorMessage);
          console.error('Ошибка при логине: ', err);
          this.cdr.markForCheck();
        }
      })

  }
}
