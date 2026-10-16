
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
  AuthService
} from '../../core/services/auth.service';

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
  ],

  templateUrl: './header.component.html',

  styleUrls: [
    './header.component.css'
  ]
})
export class HeaderComponent implements OnInit {

  currentUser: Person | null = null;

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

}