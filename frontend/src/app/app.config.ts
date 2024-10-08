import { DOCUMENT, registerLocaleData } from '@angular/common';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import ru from '@angular/common/locales/ru';
import { ApplicationConfig, importProvidersFrom, inject, InjectionToken, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import {
  AppstoreOutline,
  ArrowLeftOutline,
  BarsOutline,
  DeleteOutline,
  DollarOutline,
  DownloadOutline,
  EyeInvisibleOutline,
  EyeOutline,
  LockOutline,
  LogoutOutline,
  PlusCircleOutline,
  RocketOutline,
  RollbackOutline,
  SaveOutline,
  SettingOutline,
  StarFill,
  StarOutline,
  UserOutline
} from '@ant-design/icons-angular/icons';
import { unauthorizedInterceptor } from '@interceptors/unauthorized.interceptor';
import { provideNzI18n, ru_RU } from 'ng-zorro-antd/i18n';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { NzModalService } from 'ng-zorro-antd/modal';
import { routes } from './app.routes';

registerLocaleData(ru);

export const WINDOW: InjectionToken<Window> = new InjectionToken<Window>(
  'window object',
  {
    factory: () => inject(DOCUMENT).defaultView!,
  }
);

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideRouter(routes),
    provideNzIcons([
      LogoutOutline,
      StarOutline,
      StarFill,
      AppstoreOutline,
      BarsOutline,
      StarOutline,
      DeleteOutline,
      PlusCircleOutline,
      UserOutline,
      LockOutline,
      DollarOutline,
      EyeOutline,
      EyeInvisibleOutline,
      ArrowLeftOutline,
      RocketOutline,
      DownloadOutline,
      RollbackOutline,
      SaveOutline,
      SettingOutline
    ]),
    provideNzI18n(ru_RU),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([unauthorizedInterceptor])),
    NzModalService,
  ],
};
