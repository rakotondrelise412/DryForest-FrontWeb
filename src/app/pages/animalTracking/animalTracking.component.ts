import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  catchError,
  finalize,
  map,
  tap
} from 'rxjs/operators';

import { AnimalObservedByZone } from '../../models/animalTracking.model';
import { PageResponse } from '../../models/page-response.model';
import { AnimalTrackingService } from '../../services/animalTracking.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'animal-tracking-observed',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent
  ],
  templateUrl: './animalTracking.component.html',
  styleUrls: ['./animalTracking.component.css']
})


export class AnimalTrackingComponent implements OnInit {

  // Liste des animaux observés affichée dans le tableau.
  animalObserved$: Observable<AnimalObservedByZone[]> = of([]);

  // État du composant.
  isLoading = false;
  errorMessage = '';

  // Pagination : Spring Boot commence à 0.
  currentPage = this.getSavedPage();
  pageSize = this.getSavedPageSize();

  totalElements = 0;
  totalPages = 0;

  constructor(
    private animalTrackingService: AnimalTrackingService
  ) {}

  ngOnInit(): void {
    this.loadAnimalObservedByZone();
  }

  /**
   * Récupérer la page enregistrée.
   */
  private getSavedPage(): number {
    const page = Number(
      localStorage.getItem('animalObservedCurrentPage')
    );

    return Number.isInteger(page) && page >= 0
      ? page
      : 0;
  }

  /**
   * Récupérer la taille de page enregistrée.
   */
  private getSavedPageSize(): number {
    const savedSize = localStorage.getItem(
      'animalObservedPageSize'
    );

    const size = Number(savedSize);

    const allowedSizes = [
      5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100
    ];

    return allowedSizes.includes(size)
      ? size
      : 10;
  }

  /**
   * Charger les animaux observés par zone.
   */
  loadAnimalObservedByZone(
    page: number = this.currentPage
  ): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.currentPage = page;

    localStorage.setItem(
      'animalObservedCurrentPage',
      String(this.currentPage)
    );

    localStorage.setItem(
      'animalObservedPageSize',
      String(this.pageSize)
    );

    this.animalObserved$ = this.animalTrackingService
      .getAnimalObservedByZone(
        this.currentPage,
        this.pageSize
      )
      .pipe(
        tap((response: PageResponse<AnimalObservedByZone>) => {
          // Mise à jour avec les valeurs du backend.
          this.totalElements = response.page.totalElements;
          this.totalPages = response.page.totalPages;
          this.currentPage = response.page.number;
          this.pageSize = response.page.size;

          // Enregistrer les valeurs reçues.
          localStorage.setItem(
            'animalObservedCurrentPage',
            String(this.currentPage)
          );

          localStorage.setItem(
            'animalObservedPageSize',
            String(this.pageSize)
          );
        }),

        // Le HTML reçoit uniquement le tableau des résultats.
        map((response: PageResponse<AnimalObservedByZone>) =>
          response.content
        ),

        catchError(error => {
          console.error(
            'Erreur lors du chargement des observations',
            error
          );

          this.errorMessage = this.getErrorMessage(error);
          this.totalElements = 0;
          this.totalPages = 0;

          return of([] as AnimalObservedByZone[]);
        }),

        finalize(() => {
          this.isLoading = false;
        })
      );
  }

  /**
   * Page précédente.
   */
  previousPage(): void {
    if (this.isLoading || this.currentPage <= 0) {
      return;
    }

    this.loadAnimalObservedByZone(
      this.currentPage - 1
    );
  }

  /**
   * Page suivante.
   */
  nextPage(): void {
    if (
      this.isLoading ||
      this.currentPage >= this.totalPages - 1
    ) {
      return;
    }

    this.loadAnimalObservedByZone(
      this.currentPage + 1
    );
  }

  /**
   * Modifier la taille de page.
   */
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
      'animalObservedPageSize',
      String(size)
    );

    localStorage.setItem(
      'animalObservedCurrentPage',
      '0'
    );

    this.loadAnimalObservedByZone(0);
  }

  /**
   * Afficher un message adapté en cas d'erreur.
   */
  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue.';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le serveur est démarré et que son URL est correcte.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Accès refusé. Vérifiez votre authentification et vos autorisations.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${
      error.message || 'Problème de connexion.'
    }`;
  }
}