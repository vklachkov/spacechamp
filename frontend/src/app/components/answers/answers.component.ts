import { Component, Input } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Answers } from '@models/api/participant.interface';

export const EMPTY_ANSWER: string = 'Нет ответа';

@Component({
  selector: 'app-answers',
  standalone: true,
  imports: [
    NzTypographyComponent,
    KeyValuePipe
  ],
  templateUrl: './answers.component.html',
  styleUrl: './answers.component.scss'
})
export class AnswersComponent {
  protected readonly EMPTY_ANSWER: string = EMPTY_ANSWER;
  protected readonly QUESTIONS: string[] = [
    "Расскажи о своих навыках – что ты умеешь в инженерной или научной деятельности и на каком уровне ты владеешь этими навыками? Что ты умеешь делать лучше других?",
    "Расскажи о своих достижениях – о проектах, которые ты реализовал раньше и какую роль ты в этих проектах выполнял?",
    "Расскажи о трех самых ярких конкурсах, в которых ты принимал участие",
    "Как ты думаешь, почему человек летает в космос не дальше орбиты МКС? Почему космические агентства до сих пор не освоили Луну, не долетели до Марса и не научились приземляться на астероиды? Какие направления науки и технологий надо усиленно развивать, чтобы как можно скорее достичь новых горизонтов в космосе?",
  ];

  @Input({ required: true }) answers!: Answers;
}
