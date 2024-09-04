import { FormControl } from "@angular/forms"

export type FormGroupType = {
  email: FormControl<string | null>,
  password: FormControl<string | null>
}

export type FormGroupValue = {
  email?: string | null
  password?: string | null
}