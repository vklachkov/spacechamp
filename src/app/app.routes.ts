import { Routes } from '@angular/router';
import { AdminPanelPage } from './pages/admin-panel/admin-panel.component';
import { JuryPanelPage } from './pages/jury-panel/jury-panel.component';

export const enum ROUTE_PATHS {
    Login = 'login',
    AdminPanel = 'admin-panel',
    JuryPanel = 'jury-panel'
} 

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: ROUTE_PATHS.AdminPanel
    },
    {
        // TODO: сделать компонент
        path: ROUTE_PATHS.Login,
        redirectTo: 'test'
    },
    { 
        path: ROUTE_PATHS.AdminPanel, 
        component: AdminPanelPage 
    },
    { 
        path: ROUTE_PATHS.JuryPanel, 
        component: JuryPanelPage 
    },
];
