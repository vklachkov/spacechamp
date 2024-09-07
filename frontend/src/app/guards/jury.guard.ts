import {
  CanActivateFn,
  RedirectCommand,
  Router,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';
import { LocalStorageService } from '../services/local-storage.service';
import { Role } from '../models/api/role.enum';

export function juryGuard(): CanActivateFn {
  return () => {
    const localStorageService: LocalStorageService =
      inject(LocalStorageService);
    const router: Router = inject(Router);

    // TODO: надо валидировать токен по нормальному
    if (
      localStorageService.getToken() &&
      localStorageService.getRole() === Role.Jury
    ) {
      return true;
    }

    const urlTree: UrlTree = router.parseUrl('login');
    return new RedirectCommand(urlTree);
  };
}
