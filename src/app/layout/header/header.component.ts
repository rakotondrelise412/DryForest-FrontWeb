// src/app/layout/header/header.component.ts

import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  CommonModule
} from '@angular/common';

import {
  Router
} from '@angular/router';

import {
  TranslatePipe
} from '@ngx-translate/core';

import {
  AuthService
} from '../../core/services/auth.service';

import {
  LanguageService,
  Language
} from '../../core/services/language.service';

import {
  Person
} from '../../models/person.model';

import {
  SidebarService
} from '../../services/sidebar.service';

@Component({
  selector: 'app-header',
  standalone: true,

  imports: [
    CommonModule,
    TranslatePipe
  ],

  templateUrl: './header.component.html',

  styleUrls: [
    './header.component.css'
  ]
})
export class HeaderComponent implements OnInit {

  currentUser: Person | null = null;

  readonly languageService =
    inject(LanguageService);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sidebarService: SidebarService
  ) {}

  ngOnInit(): void {

    this.currentUser =
      this.authService.getCurrentUser();

  }

  toggleSidebar(): void {

    this.sidebarService.toggle();

  }

  logout(): void {

    this.authService.logout();

    this.router.navigate([
      '/login'
    ]);

  }

  changeLanguage(
    language: Language
  ): void {

    console.log(
      'Langue sélectionnée :',
      language
    );

    this.languageService.changeLanguage(
      language
    );
  }
}