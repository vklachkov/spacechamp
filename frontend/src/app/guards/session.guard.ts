import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '@services/local-storage.service';
import { ROOT_ROUTE_PATHS } from '../app.routes';

export function sessionGuard(): CanActivateFn {
  return () => {
    const localStorageService: LocalStorageService =
      inject(LocalStorageService);
    const router: Router = inject(Router);

    if (
      !localStorageService.getRole() ||
      !localStorageService.getName() ||
      !localStorageService.getUserId()
    ) {
      return true;
    }

    const urlTree: UrlTree = router.parseUrl(ROOT_ROUTE_PATHS.Index);
    return new RedirectCommand(urlTree);
  };
}
