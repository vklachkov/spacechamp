import type { Role } from './role.enum';

// Данные, возвращаемые после логина
export interface LoginOutput {
  // Роль пользователя
  role: Role;
}
