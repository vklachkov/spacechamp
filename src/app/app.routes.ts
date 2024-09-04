import { Routes } from '@angular/router';
import { AdminPanelPage } from './pages/admin-panel/admin-panel.component';
import { JuryPanelPage } from './pages/jury-panel/jury-panel.component';
import { AdminPanelJuryPage } from './pages/admin-panel-jury/admin-panel-jury.component';
import { AdminPanelParticipantPage } from './pages/admin-panel-participant/admin-panel-participant.component';
import { LoginPage } from './pages/login/login.component';

export const enum ROOT_ROUTE_PATHS {
    Index = '',
    Login = 'login',
    AdminPanel = 'admin-panel',
    JuryPanel = 'jury-panel'
} 

export const enum ADMIN_ROOT_PATHS {
    Jury = 'jury',
    Participant = 'participant'
}

export const routes: Routes = [
    {
        // TODO: потом сделать редирект в зависимости от бэка
        path: ROOT_ROUTE_PATHS.Index,
        pathMatch: 'full',
        redirectTo: ROOT_ROUTE_PATHS.AdminPanel
    },
    {
        path: ROOT_ROUTE_PATHS.Login,
        component: LoginPage
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
            },
            {
                path: `${ADMIN_ROOT_PATHS.Participant}/:id`,
                component: AdminPanelParticipantPage
            }
        ]
    },
    { 
        path: ROOT_ROUTE_PATHS.JuryPanel, 
        component: JuryPanelPage 
    },
];
