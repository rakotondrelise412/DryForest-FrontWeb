
import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { PersonService } from '../../../services/person.service';
import { Person, PersonPage } from '../../../models/person.model';
import { PaginationComponent } from '../../../shared/components/pagination/pagination';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent
  ],
  templateUrl: './person-list.html',
  styleUrls: ['./person-list.css']
})
export class PersonListComponent {
  persons$: Observable<Person[]> = of([]);

  isLoading = false;
  errorMessage = '';

  currentPage = this.getSavedPage();
  pageSize = this.getSavedPageSize();

  totalElements = 0;
  totalPages = 0;

  constructor(
    private personService: PersonService
  ) {
    this.loadPersons();
  }

 
  private getSavedPage(): number {
    const page = Number(
      localStorage.getItem('personCurrentPage')
    );

    return Number.isInteger(page) && page >= 0
      ? page
      : 0;
  }

  
  private getSavedPageSize(): number {
    const savedSize = localStorage.getItem(
      'personPageSize'
    );

    const size = Number(savedSize);

    const allowedSizes = [
      5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    ];

    return allowedSizes.includes(size) ? size : 10;
  }

 
  loadPersons(page: number = this.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.currentPage = page;

    localStorage.setItem(
      'personCurrentPage',
      String(this.currentPage)
    );

    localStorage.setItem(
      'personPageSize',
      String(this.pageSize)
    );

    this.persons$ = this.personService
      .getAllPersons(this.currentPage, this.pageSize)
      .pipe(
        tap((response: PersonPage) => {
          this.totalElements = response.page.totalElements;
          this.totalPages = response.page.totalPages;
          this.currentPage = response.page.number;
          this.pageSize = response.page.size;

          localStorage.setItem(
            'personCurrentPage',
            String(this.currentPage)
          );

          localStorage.setItem(
            'personPageSize',
            String(this.pageSize)
          );
        }),

        map((response: PersonPage) => response.content),

        catchError(error => {
          this.errorMessage = this.getErrorMessage(error);
          this.totalElements = 0;
          this.totalPages = 0;

          return of([] as Person[]);
        }),

        finalize(() => {
          this.isLoading = false;
        })
      );
  }

  previousPage(): void {
    if (this.isLoading || this.currentPage <= 0) {
      return;
    }

    this.loadPersons(this.currentPage - 1);
  }

  nextPage(): void {
    if (
      this.isLoading ||
      this.currentPage >= this.totalPages - 1
    ) {
      return;
    }

    this.loadPersons(this.currentPage + 1);
  }

  
  changePageSize(size: number): void {
    if (
      this.isLoading ||
      size <= 0 ||
      size === this.pageSize
    ) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 0;

    localStorage.setItem(
      'personPageSize',
      String(size)
    );

    localStorage.setItem(
      'personCurrentPage',
      '0'
    );

    this.loadPersons(0);
  }

  getFullName(person: Person): string {
    return `${person.first_name} ${person.last_name}`;
  }

  getPersonId(person: Person): number | undefined {
    return person.id ?? person.id_person;
  }

  isPersonDeleted(person: Person): boolean {
    return person._deleted ?? person.is_deleted ?? false;
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le serveur est démarré et que son URL est correcte.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Accès refusé. Vérifiez votre authentification, vos autorisations et la configuration CORS.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${
      error.message || 'Problème de connexion'
    }`;
  }

  formatNumber(value: number): string {
    return new DecimalPipe('fr').transform(value, '1.4-6') || '';
  }

  formatDate(date: string): string {
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy HH:mm') || '';
  }
}
