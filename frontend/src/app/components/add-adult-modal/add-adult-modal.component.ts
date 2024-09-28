import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzModalFooterDirective, NzModalRef } from 'ng-zorro-antd/modal';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent, NzFormModule } from 'ng-zorro-antd/form';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzSwitchComponent } from 'ng-zorro-antd/switch';
import { NzInputDirective } from 'ng-zorro-antd/input';
import { Adult } from '@models/api/adult.interface';
import { AdultRole } from '@models/api/adult-role.enum';

export type FormGroupType = {
  name: FormControl<string | null>;
  password: FormControl<string | null>;
  isOrganizer: FormControl<boolean | null>;
};

export type FormGroupValue = {
  name: string;
  password: string;
  isOrganizer: boolean;
};

@Component({
  selector: 'app-add-adult-modal',
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
  templateUrl: './add-adult-modal.component.html',
  styleUrl: './add-adult-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddAdultModalComponent {
  protected readonly form: FormGroup<FormGroupType> = new FormGroup<FormGroupType>({
    name: new FormControl<string | null>(null, [Validators.required]),
    password: new FormControl<string | null>({
      value: this.generatePassword(),
      disabled: true
    }, [Validators.required]),
    isOrganizer: new FormControl<boolean | null>(false),
  });

  private readonly modalRef: NzModalRef<undefined, Omit<Adult, 'id'>> = inject(NzModalRef);

  private generatePassword(): string {
    return Math.random().toString(36).slice(-8);
  }

  close(data?: Omit<Adult, 'id'>): void {
    this.modalRef.close(data);
  }

  add(): void {
    const { isOrganizer, ...model } = {
      ...(<FormGroupValue>this.form.getRawValue()),
      role: this.form.value.isOrganizer ? AdultRole.Organizer : AdultRole.Jury
    }

    this.close(model);
  }
}
