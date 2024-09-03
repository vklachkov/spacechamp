import { FormControl } from "@angular/forms"

export type FormGroupType = {
  name: FormControl<string | null>,
  email: FormControl<string | null>
}

export type FormGroupValue = {
  name: string,
  email: string
}