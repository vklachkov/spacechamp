import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { FormGroupType, FormGroupValue } from './add-jury-modal';
import { Adult } from '../../models/api/adult.interface';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { AdultRole } from '../../models/api/adult-role.enum';

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
    NzSwitchComponent,
    NzTypographyComponent,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './add-jury-modal.component.html',
  styleUrl: './add-jury-modal.component.scss'
})
export class AddJuryModalComponent {
  form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>(null, [Validators.required]),
    isOrganizer: new FormControl<boolean | null>(false),
  });

  private readonly modalRef: NzModalRef<undefined, Omit<Adult, 'id'>> = inject(NzModalRef);

  close(data?: Omit<Adult, 'id'>): void {
    this.modalRef.close(data);
  }

  add(): void {
    const { isOrganizer, ...model } = {
      ...(<FormGroupValue>this.form.value),
      role: this.form.value.isOrganizer ? AdultRole.Organizer : AdultRole.Jury
    }

    this.close(model);
  }
}
