import { AdultRole } from './adult-role.enum';

// Взрослый (жюри или организатор)
export interface Adult {
  // Идентификатор
  id: number;
  // Имя
  name: string;
  // Пароль
  password: string;
  // Роль
  role: AdultRole;
}
