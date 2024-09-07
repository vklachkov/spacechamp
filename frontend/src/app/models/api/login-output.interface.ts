import type { Role } from './role.enum';

export interface LoginOutput {
  token: string;
  role: Role;
}
