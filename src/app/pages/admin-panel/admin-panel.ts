import { FormControl } from "@angular/forms";
import { JuriScore, Participant } from "../../models/participant";

// TODO: надо бы наверное вынести куда получше, уже много где юзается
export enum ViewType {
  Grid = 'grid',
  List = 'list'
};

export enum ParticipantStatus {
  Evaluated = 'evaluated',
  NotEvaluated = 'not-evaluated',
  InTeam = 'in-team'
}

export const mockData: Participant[] = Array.from({ length: 50 }, (_, index) => {
  return {
    id: index + 1,
    info: {
      name: "Петроуговен Абдулагбек Чингызханович" + ' ' + Math.random().toFixed(4),
      photoUrl: "https://kartinki.pics/pics/uploads/posts/2022-09/1662615787_1-kartinkin-net-p-milie-kotiki-v-shapochkakh-instagram-1.jpg",
      location: "г. Подзалупинск-на-Каказе" + ' ' + Math.random().toFixed(5),
      phoneNumber: "+7-999-555-35-35",
      email: "test@mail.ru",
      org: "МОУ СОШ №1",
    },
    answers: {},
    scores: index % 9 !== 0
      ? <Record<number, JuriScore>>{ 1: { salary: 4, comment: "Норм участник" } }
      : <Record<number, JuriScore>>{ },
  };
});

export type FilterForm = {
  search: FormControl<string | null>,
  status: FormControl<ParticipantStatus | null>
}

export type FilterFormValue = {
  search?: string | null,
  status?: ParticipantStatus | null
}