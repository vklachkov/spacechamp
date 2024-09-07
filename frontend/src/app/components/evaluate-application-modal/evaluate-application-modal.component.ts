import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormGroupType, FormGroupValue } from './evaluate-application-modal';
import { Jury } from '../../models/jury';
import { JuriScore } from '../../models/participant';

@Component({
  selector: 'app-evaluate-application-modal',
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
  templateUrl: './evaluate-application-modal.component.html',
  styleUrl: './evaluate-application-modal.component.scss'
})
export class EvaluateApplicationModalComponent {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    salary: new FormControl<number | null>(null, [Validators.required]),
    comment: new FormControl<string | null>(null)
  });

  private readonly modalRef: NzModalRef<undefined, JuriScore> = inject(NzModalRef);

  close(data?: JuriScore): void {
    this.modalRef.close(data);
  }

  evaluate(): void {
    this.close(<FormGroupValue>this.form.value);
  }
}
