
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { ObservationPatrol } from '../../models/observation.model';
import { PageResponse } from '../../models/page-response.model';
import { ObservationService } from '../../services/observationPatrol.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-observation-patrol',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './observationPatrol.component.html',
  styleUrls: ['./observationPatrol.component.css'],
})
export class ObservationPatrolComponent implements OnInit {
  private requestId = 0;

  private readonly allowedPageSizes = [
    5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100,
  ];

  observationPatrol: ObservationPatrol[] = [];

  isLoading = false;
  errorMessage = '';

  // Pagination : l'API utilise un index commençant à 0.
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  constructor(
    private readonly observationPatrolService: ObservationService,
    private readonly cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Valeurs par défaut au démarrage.
    this.currentPage = 0;
    this.pageSize = 10;

    this.loadObservationPatrol(0);
  }

  /**
   * Charge les observations de la page demandée.
   */
  loadObservationPatrol(page: number = this.currentPage): void {
    const requestedPage =
      Number.isInteger(page) && page >= 0 ? page : 0;

    const requestId = ++this.requestId;

    this.currentPage = requestedPage;
    this.isLoading = true;
    this.errorMessage = '';

    this.observationPatrolService
      .getAll(requestedPage, this.pageSize)
      .pipe(
        tap((response: PageResponse<ObservationPatrol>) => {
          if (requestId !== this.requestId) {
            return;
          }

          this.totalElements = response.page.totalElements;
          this.totalPages = response.page.totalPages;
          this.pageSize = response.page.size;
        }),

        map(
          (response: PageResponse<ObservationPatrol>) =>
            response.content ?? []
        ),

        catchError((error: unknown) => {
          if (requestId === this.requestId) {
            this.errorMessage = this.getErrorMessage(error);
            this.observationPatrol = [];
            this.totalElements = 0;
            this.totalPages = 0;
          }

          return of([] as ObservationPatrol[]);
        }),

        finalize(() => {
          if (requestId === this.requestId) {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        })
      )
      .subscribe((observations) => {
        if (requestId !== this.requestId) {
          return;
        }

        this.observationPatrol = observations;
        this.cdr.detectChanges();
      });
  }

  /**
   * Change de page.
   */
  changePage(page: number): void {
    if (
      !Number.isInteger(page) ||
      page < 0 ||
      page >= this.totalPages ||
      page === this.currentPage ||
      this.isLoading
    ) {
      return;
    }

    this.loadObservationPatrol(page);
  }

  /**
   * Change le nombre d'observations affichées par page.
   */
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

    // Revenir à la première page après le changement de taille.
    this.loadObservationPatrol(0);
  }

  /**
   * Affiche un message adapté à l'erreur HTTP.
   */
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
        return 'L’endpoint des observations de patrouille est introuvable.';

      default:
        return `Erreur ${error.status} : ${
          error.error?.message ??
          error.message ??
          'Problème de connexion.'
        }`;
    }
  }

  /**
   * Identifie chaque observation dans le ngFor.
   */
  trackById(index: number, item: ObservationPatrol): number {
    return item.id_observation_patrol;
  }
}
