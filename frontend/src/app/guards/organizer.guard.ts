import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '@services/local-storage.service';
import { Role } from '@models/api/role.enum';
import { ROOT_ROUTE_PATHS } from '../app.routes';

export function organizerGuard(): CanActivateFn {
  return () => {
    const localStorageService: LocalStorageService =
      inject(LocalStorageService);
    const router: Router = inject(Router);

    if (localStorageService.getRole() === Role.Organizer) {
      return true;
    }

    const urlTree: UrlTree = router.parseUrl(ROOT_ROUTE_PATHS.Login);
    return new RedirectCommand(urlTree);
  };
}
