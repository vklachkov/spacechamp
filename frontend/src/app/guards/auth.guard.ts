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

    if (localStorageService.getRole()) {
      return true;
    }

    const urlTree: UrlTree = router.parseUrl('login');
    return new RedirectCommand(urlTree);
  };
}
