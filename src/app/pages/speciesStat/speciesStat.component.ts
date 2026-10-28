
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { PlantationService } from '../../services/plantation.service';
import { PlantationBlockSurvivalRate } from '../../models/plantation.model';
import { PageResponse } from '../../models/page-response.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-survival-rate-detail',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './speciesStat.component.html',
  styleUrls: ['./speciesStat.component.css'],
})
export class SpeciesStatComponent implements OnInit {
  private readonly storageKey = 'speciesStatCurrentPage';
  private readonly pageSizeStorageKey = 'speciesStatPageSize';

  private readonly allowedPageSizes = [
    5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  ];

  private requestId = 0;

  data: PlantationBlockSurvivalRate[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 0;
  pageSize = 10;

  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly plantationService: PlantationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
  this.currentPage = 0;
  this.pageSize = 10;

  localStorage.setItem(this.storageKey, '0');
  localStorage.setItem(this.pageSizeStorageKey, '10');

  this.loadData(0);
}

  loadData(page: number = this.currentPage): void {
    const requestedPage =
      Number.isInteger(page) && page >= 0 ? page : 0;

    const requestId = ++this.requestId;

    this.currentPage = requestedPage;
    this.isLoading = true;
    this.errorMessage = '';

    this.savePagination();

    this.plantationService
      .getSurvivalRateByBlockSubPlotAndSpecies(
        requestedPage,
        this.pageSize
      )
      .pipe(
        tap((response: PageResponse<PlantationBlockSurvivalRate>) => {
          if (requestId !== this.requestId) {
            return;
          }

          this.totalElements = response.page.totalElements;
          this.totalPages = response.page.totalPages;
          this.pageSize = response.page.size;
        }),

        map(
          (response: PageResponse<PlantationBlockSurvivalRate>) =>
            response.content ?? []
        ),

        catchError((error: unknown) => {
          if (requestId === this.requestId) {
            this.errorMessage = this.getErrorMessage(error);
            this.data = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }

          return of([] as PlantationBlockSurvivalRate[]);
        }),

        finalize(() => {
          if (requestId === this.requestId) {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        })
      )
      .subscribe((data) => {
        if (requestId !== this.requestId) {
          return;
        }

        this.data = data;
        this.cdr.detectChanges();
      });
  }

  changePageSize(size: number): void {
    if (
      this.isLoading ||
      !this.allowedPageSizes.includes(size) ||
      size === this.pageSize
    ) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 0;

    this.savePagination();
    this.loadData(0);
  }

  
  private savePagination(): void {
    localStorage.setItem(this.storageKey, String(this.currentPage));
    localStorage.setItem(
      this.pageSizeStorageKey,
      String(this.pageSize)
    );
  }

  private getErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Une erreur inattendue est survenue.';
    }

    switch (error.status) {
      case 0:
        return 'Spring Boot ne répond pas. Vérifiez que le serveur est démarré.';

      case 401:
      case 403:
        return 'Accès refusé. Vérifiez votre authentification et vos autorisations.';

      case 404:
        return 'L’endpoint des statistiques de survie est introuvable.';

      default:
        return `Erreur ${error.status} : ${
          error.error?.message ??
          error.message ??
          'Problème de connexion.'
        }`;
    }
  }
}