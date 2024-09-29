import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function salaryValidator(min: number, max: number): ValidatorFn {
  return (control: AbstractControl<number | null>): ValidationErrors | null => {
    const value: number | null = control.value;

    if (value === null) {
      return null;
    }

    if (!Number.isInteger(+value)) {
      return { notInteger: true };
    }

    if (value < min || value > max) {
      return { incorrectRange: true };
    }

    return null;
  };
}
