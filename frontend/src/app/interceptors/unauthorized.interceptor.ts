import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { catchError, EMPTY, Observable } from 'rxjs';
import { ROOT_ROUTE_PATHS } from '../app.routes';
import { LocalStorageService } from '@services/local-storage.service';

export function unauthorizedInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const localStorageService: LocalStorageService = inject(LocalStorageService);
  const router: Router = inject(Router);

  const clonedRequest: HttpRequest<unknown> = req.clone({
    withCredentials: true
  });
  return next(clonedRequest).pipe(
    catchError((err: HttpErrorResponse) => {
      // Для логина возвращаем все ошибки
      if (err.url?.includes('login')) {
        throw err;
      }

      // Для остальных страниц перенаправляем на страницу логина,
      // если пользователь у пользователя некорректные данные в куки
      if (err.status === HttpStatusCode.Forbidden) {
        localStorageService.clearData();
        router.navigate([ROOT_ROUTE_PATHS.Login]);
        return EMPTY;
      }

      throw err;
    })
  );
}
