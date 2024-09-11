import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NZ_MODAL_DATA, NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormGroupType, FormGroupValue } from './evaluate-application-modal';
import { JuryRate } from '../../models/api/participant.interface';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';

// TODO: вообще не evaluate название должно быть
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
export class EvaluateApplicationModalComponent implements OnInit {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    salary: new FormControl<number | null>(null, [Validators.required]),
    comment: new FormControl<string | null>(null)
  });

  private readonly modalData: AnonymousParticipant | null = inject(NZ_MODAL_DATA);
  private readonly modalRef: NzModalRef<undefined, JuryRate> = inject(NzModalRef);

  ngOnInit(): void {
    if (this.modalData?.rate) {
      this.form.patchValue(this.modalData.rate);

      if (this.modalData?.in_command) {
        this.form.disable();
      }
    }
  }

  close(data?: JuryRate): void {
    this.modalRef.close(data);
  }

  evaluate(): void {
    this.close({
      salary: <number>this.form.value.salary,
      comment: this.form.value.comment ?? ''
    });
  }
}
