import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import {
  NZ_MODAL_DATA,
  NzModalFooterDirective,
  NzModalRef,
} from 'ng-zorro-antd/modal';
import {
  NzFormControlComponent,
  NzFormItemComponent,
  NzFormLabelComponent,
  NzFormModule,
} from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { NzInputNumberComponent } from 'ng-zorro-antd/input-number';
import {
  FormGroupType,
  MAX_SALARY,
  MIN_SALARY,
} from './rate-application-modal';
import { JuryRate } from '../../models/api/participant.interface';
import { AnonymousParticipant } from '../../models/api/anonymous-participant.interface';
import { salaryValidator } from '../../validators/salary.validator';

@Component({
  selector: 'app-rate-application-modal',
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
    NzInputNumberComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './rate-application-modal.component.html',
  styleUrl: './rate-application-modal.component.scss',
})
export class RateApplicationModalComponent implements OnInit {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    salary: new FormControl<number | null>(null, [
      Validators.required,
      salaryValidator(MIN_SALARY, MAX_SALARY),
    ]),
    comment: new FormControl<string | null>(null),
  });

  private readonly modalData: AnonymousParticipant | null = inject(NZ_MODAL_DATA);
  private readonly modalRef: NzModalRef<undefined, JuryRate> = inject(NzModalRef);

  ngOnInit(): void {
    if (!this.modalData?.rate) {
      return;
    }

    this.form.patchValue(<JuryRate>this.modalData.rate);

    if (this.modalData?.in_command) {
      this.form.disable();
    }
  }

  close(data?: JuryRate): void {
    this.modalRef.close(data);
  }

  rate(): void {
    this.close({
      salary: <number>this.form.value.salary,
      comment: this.form.value.comment ?? '',
    });
  }
}
