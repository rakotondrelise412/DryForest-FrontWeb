// src/app/app.config.ts

import {
  ApplicationConfig,
  LOCALE_ID
} from '@angular/core';

import {
  provideRouter
} from '@angular/router';

import {
  provideHttpClient,
  withInterceptors
} from '@angular/common/http';

import {
  provideAnimations
} from '@angular/platform-browser/animations';

import {
  provideTranslateService
} from '@ngx-translate/core';

import {
  provideTranslateHttpLoader
} from '@ngx-translate/http-loader';

import { routes } from './app.routes';

import {
  authInterceptor
} from './core/interceptors/auth.interceptor';

export const appConfig: ApplicationConfig = {

  providers: [

    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    ),

    provideRouter(routes),

    {
      provide: LOCALE_ID,
      useValue: 'fr'
    },

    provideAnimations(),

    provideTranslateService({

      loader: provideTranslateHttpLoader({
        prefix: './assets/i18n/',
        suffix: '.json'
      }),

      fallbackLang: 'mg'

    })

  ]

};