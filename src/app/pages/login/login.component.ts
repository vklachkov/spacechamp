import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzInputDirective, NzInputGroupComponent } from 'ng-zorro-antd/input';
import { FormGroupType, FormGroupValue } from './login';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { Router } from '@angular/router';
import { ROOT_ROUTE_PATHS } from '../../app.routes';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NzFormModule,
    NzInputDirective,
    NzInputGroupComponent,
    NzButtonComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginPage {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    email: new FormControl<string | null>(null, [Validators.required, Validators.email]),
    password: new FormControl<string | null>(null, [Validators.required])
  });

  private readonly router: Router = inject(Router);

  login(): void {
    const data: FormGroupValue = this.form.value;

    this.router.navigate([ROOT_ROUTE_PATHS.Index]);
  }
}
