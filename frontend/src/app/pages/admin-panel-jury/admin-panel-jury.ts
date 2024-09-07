import { Jury } from "../../models/jury";

export const mockData: Jury[] = Array.from({ length: 20 }, (_, index) => {
  return {
    id: index + 1,
    name: "Акакий" + ' ' + Math.random().toFixed(4),
    email: "test@mail.ru",
  };
});