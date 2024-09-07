import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../components/base/base.component';
import { LocalStorageService } from '../../services/local-storage.service';
import { Role } from '../../models/api/role.enum';
import { OrganizerPage } from '../organizer/organizer.component';
import { JuryPage } from '../jury/jury.component';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [
    OrganizerPage,
    JuryPage
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MainPage extends BaseComponent implements OnInit {
  role!: Role;
  Role = Role;
  
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.role = this.localStorageService.getRole();
  }

}
