import { FormControl } from "@angular/forms"

export type FormGroupType = {
  salary: FormControl<number | null>,
  comment: FormControl<string | null>
}

export type FormGroupValue = {
  salary: number,
  comment: string
}