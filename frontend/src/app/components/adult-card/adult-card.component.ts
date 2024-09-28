import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { NzPopoverComponent, NzPopoverDirective } from 'ng-zorro-antd/popover';
import { LocalStorageService } from '@services/local-storage.service';
import { Adult } from '@models/api/adult.interface';
import { AdultRole } from '@models/api/adult-role.enum';

@Component({
  selector: 'app-adult-card',
  standalone: true,
  imports: [
    NzCardModule,
    NzButtonComponent,
    NzIconModule,
    NzTypographyComponent,
    NzPopconfirmDirective,
    NzPopoverDirective,
    NzPopoverComponent
  ],
  templateUrl: './adult-card.component.html',
  styleUrl: './adult-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdultCardComponent implements OnInit {
  @Output() private readonly removed: EventEmitter<void> = new EventEmitter<void>();

  protected userId: number = 0;
  protected readonly AdultRole = AdultRole;

  @Input({ required: true }) adult!: Adult;

  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.userId = this.localStorageService.getUserId();
  }

  remove(): void {
    this.removed.emit();
  }
}
