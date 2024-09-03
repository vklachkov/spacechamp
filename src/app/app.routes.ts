import { Routes } from '@angular/router';
import { AdminPanelPage } from './pages/admin-panel/admin-panel.component';
import { JuriPanelPage } from './pages/jury-panel/juri-panel.component';

export const routes: Routes = [
    { path: 'admin-panel', component: AdminPanelPage },
    { path: 'juri-panel', component: JuriPanelPage },
];
