import type { Role } from './role.enum';

// Данные, возвращаемые после логина
export interface LoginOutput {
  // Токен
  token: string;
  // Роль пользователя
  role: Role;
}
