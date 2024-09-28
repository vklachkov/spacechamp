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
  @Input({ required: true }) answers!: Answers;
}
