import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormGroupType, FormGroupValue } from './add-jury-modal';
import { Jury } from '../../models/jury';

@Component({
  selector: 'app-add-jury-modal',
  standalone: true,
  imports: [
    NzCardModule,
    NzButtonComponent,
    NzModalFooterDirective,
    NzFormModule,
    NzInputDirective,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-jury-modal.component.html',
  styleUrl: './add-jury-modal.component.scss'
})
export class AddJuryModalComponent {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null, [Validators.required]),
    email: new FormControl<string | null>(null, [Validators.required, Validators.email])
  });

  private readonly modalRef: NzModalRef<undefined, Omit<Jury, 'id'>> = inject(NzModalRef);

  close(data?: Omit<Jury, 'id'>): void {
    this.modalRef.close(data);
  }

  add(): void {
    this.close(<FormGroupValue>this.form.value);
  }
}
