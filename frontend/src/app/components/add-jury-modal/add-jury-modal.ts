import { FormControl } from "@angular/forms"

export type FormGroupType = {
  name: FormControl<string | null>,
  password: FormControl<string | null>,
  isOrganizer: FormControl<boolean | null>
}

export type FormGroupValue = {
  name: string,
  password: string,
  isOrganizer: boolean
}