// src/app/services/sidebar.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private isCollapsedSubject = new BehaviorSubject<boolean>(false);
  isCollapsed$ = this.isCollapsedSubject.asObservable();

  constructor() {
    // Vérifier la préférence utilisateur dans localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState) {
      this.isCollapsedSubject.next(savedState === 'true');
    }
  }

  toggle(): void {
    const newState = !this.isCollapsedSubject.value;
    this.isCollapsedSubject.next(newState);
    localStorage.setItem('sidebarCollapsed', newState.toString());
  }

  collapse(): void {
    this.isCollapsedSubject.next(true);
    localStorage.setItem('sidebarCollapsed', 'true');
  }

  expand(): void {
    this.isCollapsedSubject.next(false);
    localStorage.setItem('sidebarCollapsed', 'false');
  }
}