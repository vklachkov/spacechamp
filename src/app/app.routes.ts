import { Routes } from '@angular/router';
import { AdminPanelPage } from './pages/admin-panel/admin-panel.component';
import { JuryPanelPage } from './pages/jury-panel/jury-panel.component';
import { AdminPanelJuryPage } from './pages/admin-panel-jury/admin-panel-jury.component';

export const enum ROOT_ROUTE_PATHS {
    Login = 'login',
    AdminPanel = 'admin-panel',
    JuryPanel = 'jury-panel'
} 

export const enum ADMIN_ROOT_PATHS {
    Jury = 'jury'
}

export const routes: Routes = [
    {
        // TODO: потом сделать редирект в зависимости от бэка
        path: '',
        pathMatch: 'full',
        redirectTo: ROOT_ROUTE_PATHS.AdminPanel
    },
    {
        // TODO: сделать компонент
        path: ROOT_ROUTE_PATHS.Login,
        redirectTo: 'test'
    },
    { 
        path: ROOT_ROUTE_PATHS.AdminPanel, 
        children: [
            {
                path: '',
                component: AdminPanelPage,
            },
            {
                path: ADMIN_ROOT_PATHS.Jury,
                component: AdminPanelJuryPage,
            }
        ]
    },
    { 
        path: ROOT_ROUTE_PATHS.JuryPanel, 
        component: JuryPanelPage 
    },
];
