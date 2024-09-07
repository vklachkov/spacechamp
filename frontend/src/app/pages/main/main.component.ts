import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from '../../components/base/base.component';
import { LocalStorageService } from '../../services/local-storage.service';
import { Role } from '../../models/api/role.enum';

@Component({
  standalone: true,
  imports: [
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainPage extends BaseComponent implements OnInit {
  role!: Role;
  
  private readonly localStorageService: LocalStorageService = inject(LocalStorageService);

  ngOnInit(): void {
    this.role = this.localStorageService.getRole();
  }

}
