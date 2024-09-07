import { FormControl } from "@angular/forms"

export type FormGroupType = {
  name: FormControl<string | null>,
  email: FormControl<string | null>,
  isOrganizer: FormControl<boolean | null>
}

export type FormGroupValue = {
  name: string,
  email: string,
  isOrganizer: boolean
}