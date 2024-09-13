import { Routes } from '@angular/router';
import { LoginPage } from './pages/login/login.component';
import { MainPage } from './pages/main/main.component';
import { authGuard } from './guards/auth.guard';
import { organizerGuard } from './guards/organizer.guard';
import { juryGuard } from './guards/jury.guard';
import { OrganizerJuryPage } from './pages/organizer/pages/organizer-jury/organizer-jury.component';
import { OrganizerParticipantPage } from './pages/organizer/pages/organizer-participant/organizer-participant.component';
import { JuryApplicationPage } from './pages/jury/pages/jury-application/jury-application.component';
import { sessionGuard } from './guards/session.guard';

export const enum ROOT_ROUTE_PATHS {
    Index = '',
    Login = 'login',
} 

export const enum ORGANIZER_ROOT_PATHS {
    Adults = 'adults',
    Participant = 'participant'
}

export const enum JURY_ROOT_PATHS {
    Application = 'application'
}

export const routes: Routes = [
    {
        path: ROOT_ROUTE_PATHS.Index,
        component: MainPage,
        canActivate: [authGuard()],
    },
    {
        path: ROOT_ROUTE_PATHS.Login,
        component: LoginPage,
        canActivate: [sessionGuard()],
    },
    // Роуты для организатора
    {
        path: ORGANIZER_ROOT_PATHS.Adults,
        component: OrganizerJuryPage,
        canActivate: [organizerGuard()]
    },
    {
        path: `${ORGANIZER_ROOT_PATHS.Participant}/:id`,
        component: OrganizerParticipantPage,
        canActivate: [organizerGuard()]
    },
    // Роуты для жюри
    {
        path: `${JURY_ROOT_PATHS.Application}/:id`,
        component: JuryApplicationPage,
        canActivate: [juryGuard()]
    },
    // Роуты для неизвестных путей
    {
        path: '**',
        redirectTo: ROOT_ROUTE_PATHS.Index
    }
];
