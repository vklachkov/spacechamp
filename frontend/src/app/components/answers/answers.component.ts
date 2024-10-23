import { KeyValuePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { QA } from '@models/api/participant.interface';
import { decode } from 'he';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';

export const QUESTIONS: string[] = [
  "Расскажи о своих навыках – что ты умеешь в инженерной или научной деятельности и на каком уровне ты владеешь этими навыками? Что ты умеешь делать лучше других?",
  "Расскажи о своих достижениях – о проектах, которые ты реализовал раньше и какую роль ты в этих проектах выполнял?",
  "Расскажи о трех самых ярких конкурсах, в которых ты принимал участие",
  "Как ты думаешь, почему человек летает в космос не дальше орбиты МКС? Почему космические агентства до сих пор не освоили Луну, не долетели до Марса и не научились приземляться на астероиды? Какие направления науки и технологий надо усиленно развивать, чтобы как можно скорее достичь новых горизонтов в космосе?",
];

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
  protected readonly QUESTIONS: string[] = QUESTIONS;

  @Input({ required: true }) answers!: QA;

  protected textDecode(text: string): string {
    return decode(text);
  }
}