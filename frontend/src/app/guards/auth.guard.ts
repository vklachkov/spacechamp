import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';

export function authGuard(): CanActivateFn {
  return () => {
    const localStorageService: LocalStorageService =
      inject(LocalStorageService);
    const router: Router = inject(Router);

    // TODO: надо валидировать по нормальному
    if (localStorageService.getRole() && localStorageService.getToken()) {
      return true;
    }

    const urlTree: UrlTree = router.parseUrl('login');
    return new RedirectCommand(urlTree);
  };
}
