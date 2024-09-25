import { ApplicationConfig, importProvidersFrom, provideExperimentalZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideNzIcons } from 'ng-zorro-antd/icon';
import { ru_RU, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { FormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  LogoutOutline,
  StarOutline,
  StarFill,
  AppstoreOutline,
  BarsOutline,
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
} from '@ant-design/icons-angular/icons';
import { unauthorizedInterceptor } from './interceptors/unauthorized.interceptor';
import { NzModalService } from 'ng-zorro-antd/modal';

registerLocaleData(ru);

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
