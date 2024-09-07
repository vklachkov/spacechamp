import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { takeUntil } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../../app.routes';
import { LoginInput } from '../../models/api/login-input.interface';
import { AuthService } from '../../services/auth.service';
import { BaseComponent } from '../../components/base/base.component';
import { LocalStorageService } from '../../services/local-storage.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzButtonComponent,
    NzTypographyComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPage extends BaseComponent {
  form = new FormGroup({
    name: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required])
  });

  private readonly authService: AuthService = inject(AuthService);
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);
  private readonly router: Router = inject(Router);

  login(): void {
    const data: LoginInput = <LoginInput>this.form.value;

    this.authService.login(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (loginData) => {
          this.localStorageService.setAuthData(loginData);

          this.router.navigate([ROOT_ROUTE_PATHS.AdminPanel]);
        },
        error: (err: HttpErrorResponse) => {
          this.notificationService.error('Ошибка', err.message ?? 'Ошибка при логине');
          console.error('Ошибка при логине: ', err);
        }
      })

  }
}
