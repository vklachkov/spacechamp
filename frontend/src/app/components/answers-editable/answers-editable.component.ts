import { Component, inject, OnInit } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { ControlContainer, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzFormControlComponent, NzFormItemComponent, NzFormLabelComponent } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AnswersFormType } from '../participant-questionnarie-tab/participant-questionnarie-tab.component';

@Component({
  selector: 'app-answers-editable',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzTypographyComponent,
    KeyValuePipe,
    NzFormItemComponent,
    NzFormLabelComponent,
    NzFormControlComponent,
    NzInputModule
  ],
  templateUrl: './answers-editable.component.html',
  styleUrl: './answers-editable.component.scss'
})
export class AnswersEditableComponent implements OnInit {
  answersForm!: FormGroup<AnswersFormType>;

  private readonly controlContainer: ControlContainer = inject(ControlContainer);

  ngOnInit(): void {
    this.answersForm = <FormGroup<AnswersFormType>>this.controlContainer.control;
  }
}
