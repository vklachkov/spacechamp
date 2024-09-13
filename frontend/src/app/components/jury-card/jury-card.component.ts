import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzButtonComponent } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyComponent } from 'ng-zorro-antd/typography';
import { NzPopconfirmDirective } from 'ng-zorro-antd/popconfirm';
import { Adult } from '../../models/api/adult.interface';
import { AdultRole } from '../../models/api/adult-role.enum';
import { LocalStorageService } from '../../services/local-storage.service';
import { NzPopoverComponent, NzPopoverDirective } from 'ng-zorro-antd/popover';

@Component({
  selector: 'app-jury-card',
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
  templateUrl: './jury-card.component.html',
  styleUrl: './jury-card.component.scss'
})
export class JuryCardComponent implements OnInit {
  @Input({ required: true }) public adult!: Adult;
  AdultRole = AdultRole;

  userId: number = 0;

  @Output() public readonly removed: EventEmitter<void> = new EventEmitter<void>();

  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.userId = this.localStorageService.getUserId();
  }

  remove(): void {
    this.removed.emit();
  }
}
