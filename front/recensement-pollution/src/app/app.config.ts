import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NgxsModule, provideStore } from '@ngxs/store';
import { AuthState } from '../shared/states/auth-state';
import { NgxsStoragePlugin, NgxsStoragePluginModule,  withNgxsStoragePlugin } from '@ngxs/storage-plugin';
import { UserFavorisState } from '../shared/states/user-favoris-state';
import { ApiHttpInterceptor } from './http-interceptor';
import { AccesTokenState } from '../shared/states/acces-token-state';
import { StorageOption } from '@ngxs/storage-plugin';
import { LOCAL_STORAGE_ENGINE, SESSION_STORAGE_ENGINE } from '@ngxs/storage-plugin';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    provideHttpClient(),
    provideStore(
      [AuthState, UserFavorisState, AccesTokenState],
      withNgxsStoragePlugin({
        keys: [
          { key: 'auth', engine: LOCAL_STORAGE_ENGINE },
          { key: 'usersFavoris', engine: LOCAL_STORAGE_ENGINE },
          { key: 'accesToken', engine: SESSION_STORAGE_ENGINE } // Ne va pas dans le localStorage, mais le sessionStorage
        ]
      })
    ),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: HTTP_INTERCEPTORS, useClass: ApiHttpInterceptor, multi: true },
  ]
};
