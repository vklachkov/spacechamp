import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { Jury } from '../../models/jury';

@Component({
  selector: 'app-jury-card',
  standalone: true,
  imports: [
    NzCardModule,
    NzButtonComponent,
    NzIconModule,
    NzTypographyComponent,
    NzPopconfirmDirective
  ],
  templateUrl: './jury-card.component.html',
  styleUrl: './jury-card.component.scss'
})
export class JuryCardComponent {
  @Input({ required: true }) public jury!: Jury;

  @Output() public readonly removed: EventEmitter<void> = new EventEmitter<void>();

  public evaluated: boolean = false;

  changeEvaluated(): void {
    this.evaluated = !this.evaluated;
  }

  remove(): void {
    this.removed.emit();
  }
}
