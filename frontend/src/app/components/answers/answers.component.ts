import { Component, Input } from '@angular/core';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { Answers } from '../../models/api/participant.interface';
import { KeyValuePipe } from '@angular/common';
import { EMPTY_ANSWER } from './answers';

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
  @Input({ required: true }) public answers!: Answers;
  protected readonly EMPTY_ANSWER: string = EMPTY_ANSWER;
}
