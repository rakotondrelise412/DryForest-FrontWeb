
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { PlantingMonitoringService } from '../../services/plantingMonitoring.service';
import { SpeciesStat } from '../../models/speciesFilter.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-species-stat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PaginationComponent
  ],
  templateUrl: './survival-rate-detail.component.html',
  styleUrls: ['./survival-rate-detail.component.css']
})
export class SurvivalRateDetailComponent {
  speciesStat$: Observable<SpeciesStat[]> = of([]);

  isLoading = false;
  errorMessage = '';

  // Filtres de dates
  startDate = localStorage.getItem('speciesStatStartDate') ?? '';
  endDate = localStorage.getItem('speciesStatEndDate') ?? '';

  // Pagination : Angular commence à 1.
  currentPage = this.getSavedCurrentPage();
  pageSize = this.getSavedPageSize();

  totalElements = 0;
  totalPages = 0;

  constructor(
    private plantingMonitoringService: PlantingMonitoringService
  ) {
    this.loadSpeciesStat();
  }

  /**
   * Récupère la page enregistrée.
   */
  private getSavedCurrentPage(): number {
    const page = Number(
      localStorage.getItem('speciesStatCurrentPage')
    );

    return Number.isInteger(page) && page >= 1
      ? page
      : 1;
  }

  /**
   * Récupère la taille de page enregistrée.
   */
  private getSavedPageSize(): number {
    const savedSize = localStorage.getItem(
      'speciesStatPageSize'
    );

    const size = Number(savedSize);

    const allowedSizes = [
      5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    ];

    return allowedSizes.includes(size) ? size : 10;
  }

  loadSpeciesStat(): void {
    this.loadPage();
  }

  private loadPage(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Sauvegarder les filtres de dates.
    localStorage.setItem(
      'speciesStatStartDate',
      this.startDate
    );

    localStorage.setItem(
      'speciesStatEndDate',
      this.endDate
    );

    // Spring Boot commence à 0.
    const pageIndex = this.currentPage - 1;

    const request$ =
      this.startDate && this.endDate
        ? this.plantingMonitoringService.getSpeciesStatByDate(
            this.startDate,
            this.endDate,
            pageIndex,
            this.pageSize
          )
        : this.plantingMonitoringService.getSpeciesStat(
            pageIndex,
            this.pageSize
          );

    this.speciesStat$ = request$.pipe(
      tap(response => {
        this.totalElements = response.page.totalElements;
        this.totalPages = response.page.totalPages;
        this.pageSize = response.page.size;

        // Convertir l'index Spring Boot en numéro Angular.
        this.currentPage = response.page.number + 1;

        // Enregistrer la page réellement renvoyée.
        localStorage.setItem(
          'speciesStatCurrentPage',
          String(this.currentPage)
        );

        localStorage.setItem(
          'speciesStatPageSize',
          String(this.pageSize)
        );
      }),

      map(response => response.content),

      catchError(error => {
        this.errorMessage = this.getErrorMessage(error);
        this.totalElements = 0;
        this.totalPages = 0;

        return of([] as SpeciesStat[]);
      }),

      finalize(() => {
        this.isLoading = false;
      })
    );
  }

  searchByDate(): void {
    if (!this.startDate || !this.endDate) {
      this.errorMessage =
        'Veuillez sélectionner la date de début et la date de fin.';
      return;
    }

    if (this.startDate > this.endDate) {
      this.errorMessage =
        'La date de début doit être inférieure ou égale à la date de fin.';
      return;
    }

    this.currentPage = 1;

    localStorage.setItem(
      'speciesStatStartDate',
      this.startDate
    );

    localStorage.setItem(
      'speciesStatEndDate',
      this.endDate
    );

    localStorage.setItem(
      'speciesStatCurrentPage',
      '1'
    );

    this.loadPage();
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.currentPage = 1;

    localStorage.removeItem('speciesStatStartDate');
    localStorage.removeItem('speciesStatEndDate');

    localStorage.setItem(
      'speciesStatCurrentPage',
      '1'
    );

    this.loadPage();
  }

  changePage(page: number): void {
    if (
      this.isLoading ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;

    localStorage.setItem(
      'speciesStatCurrentPage',
      String(page)
    );

    this.loadPage();
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
    this.currentPage = 1;

    localStorage.setItem(
      'speciesStatPageSize',
      String(size)
    );

    localStorage.setItem(
      'speciesStatCurrentPage',
      '1'
    );

    this.loadPage();
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue.';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le backend est démarré.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Erreur d’autorisation. Vérifiez votre connexion et vos droits d’accès.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${
      error.message || 'Problème de connexion'
    }`;
  }

  trackByStat(index: number, item: SpeciesStat): string {
    return `${item.scientific_name}-${item.date_reforestation}-${index}`;
  }
}
