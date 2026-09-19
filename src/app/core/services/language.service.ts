import {
  Injectable,
  computed,
  inject
} from '@angular/core';

import {
  TranslateService
} from '@ngx-translate/core';

export type Language = 'mg' | 'fr' | 'en';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly translate =
    inject(TranslateService);

  private readonly STORAGE_KEY =
    'dryforest_language';

  readonly languages: Language[] = [
    'mg',
    'fr',
    'en'
  ];

  readonly currentLanguage =
    computed<Language>(() => {

      const language =
        this.translate.currentLang();

      if (
        language === 'mg' ||
        language === 'fr' ||
        language === 'en'
      ) {
        return language;
      }

      return 'mg';
    });

  constructor() {
    this.initializeLanguage();
  }

  /**
   * Initialise la langue sauvegardée.
   */
  private initializeLanguage(): void {

    const savedLanguage =
      localStorage.getItem(
        this.STORAGE_KEY
      ) as Language | null;

    const language: Language =
      this.isValidLanguage(savedLanguage)
        ? savedLanguage
        : 'mg';

    this.translate.use(language);
  }

  /**
   * Vérifie si la langue est supportée.
   */
  private isValidLanguage(
    language: string | null
  ): language is Language {

    return (
      language === 'mg' ||
      language === 'fr' ||
      language === 'en'
    );
  }

  /**
   * Change la langue.
   */
  changeLanguage(
    language: Language
  ): void {

    if (!this.isValidLanguage(language)) {
      return;
    }

    console.log(
      'Changement de langue :',
      language
    );

    this.translate.use(language);

    localStorage.setItem(
      this.STORAGE_KEY,
      language
    );
  }

  /**
   * Retourne la langue actuelle.
   */
  getCurrentLanguage(): Language {
    return this.currentLanguage();
  }
}