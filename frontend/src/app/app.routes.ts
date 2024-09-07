import { Routes } from '@angular/router';
import { AdminPanelPage } from './pages/admin-panel/admin-panel.component';
import { JuryPanelPage } from './pages/jury-panel/jury-panel.component';
import { AdminPanelParticipantPage } from './pages/admin-panel-participant/admin-panel-participant.component';
import { LoginPage } from './pages/login/login.component';
import { JuryPanelApplicationPage } from './pages/jury-panel-application/jury-panel-application.component';
import { AdminPanelJuryPage } from './pages/admin-panel-jury/admin-panel-jury.component';
import { MainPage } from './pages/main/main.component';
import { authGuard } from './guards/auth.guard';

export const enum ROOT_ROUTE_PATHS {
    Index = '',
    Login = 'login',
    AdminPanel = 'admin-panel',
    JuryPanel = 'jury-panel'
} 

export const enum ADMIN_ROOT_PATHS {
    Index = '',
    Jury = 'jury',
    Participant = 'participant'
}

export const enum JURY_ROOT_PATHS {
    Index = '',
    Application = 'application'
}

export const routes: Routes = [
    {
        path: ROOT_ROUTE_PATHS.Index,
        component: MainPage,
        canActivate: [authGuard()]
    },
    {
        path: ROOT_ROUTE_PATHS.Login,
        component: LoginPage
    },
    { 
        path: ROOT_ROUTE_PATHS.AdminPanel, 
        children: [
            {
                path: ADMIN_ROOT_PATHS.Index,
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
        children: [
            {
                path: JURY_ROOT_PATHS.Index,
                component: JuryPanelPage,
            },
            {
                path: `${JURY_ROOT_PATHS.Application}/:id`,
                component: JuryPanelApplicationPage,
            },
        ]
    },
];
