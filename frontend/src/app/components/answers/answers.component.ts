import { Component, Input } from '@angular/core';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Answers } from '../../models/api/participant.interface';
import { KeyValuePipe } from '@angular/common';

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
  @Input({ required: true }) answers!: Answers;
  protected readonly EMPTY_ANSWER: string = EMPTY_ANSWER;
}
