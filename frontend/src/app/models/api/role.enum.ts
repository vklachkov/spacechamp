import { AdultRole } from './adult-role.enum';

// Роль пользователя
export enum Role {
  // Участник
  Participant = 'participant',
  // Жюри
  Jury = AdultRole.Jury,
  // Организатор
  Organizer = AdultRole.Organizer,
}
