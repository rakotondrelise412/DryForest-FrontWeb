import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';

import { PlantationService } from '../../services/plantation.service';
import { PlantationView } from '../../models/plantation.model';
import { PlantationBlock } from '../../models/plantationBlock.model';
import { PlantationBlockService } from '../../services/plantationBlock.service';
import { SpeciesFilter } from '../../models/speciesFilter.model';
import { SpeciesService } from '../../services/species.service';
import { SubPlotService } from '../../services/subPlot.service';
import { SubPlotWebFilter } from '../../models/subPlotWebFilter.model';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-plantation-list',
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './plantation.component.html',
  styleUrls: ['./plantation.component.css'],
})
export class PlantationListComponent {
  plantations$: Observable<PlantationView[]> = of([]);
  plantationBlock$: Observable<PlantationBlock[]> = of([]);
  speciesFilter$: Observable<SpeciesFilter[]> = of([]);
  subPlotFilter$: Observable<SubPlotWebFilter[]> = of([]);

  selectedBlockId: number | null = null;
  selectedSpeciesId: number | null = null;
  selectedSubPlotId: number | null = null;
  selectedDate: string | null = null;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  isLoading = false;
  errorMessage = '';

  private requestId = 0;

  constructor(
    private plantationService: PlantationService,
    private plantationBlockService: PlantationBlockService,
    private speciesService: SpeciesService,
    private subPlotService: SubPlotService,
    private cdr: ChangeDetectorRef,
  ) {
    this.loadPlantations();
    this.loadPlantationBlock();
    this.loadSpeciesFilter();
    this.loadSubPlotFilter();
  }

  loadPlantations(page: number = this.currentPage): void {
    this.currentPage = page;
    this.loadCurrentPage();
  }

  loadPlantationBlock(): void {
    this.plantationBlock$ = this.plantationBlockService
      .getAllPlantationBlocks()
      .pipe(
        catchError(() => of([] as PlantationBlock[])),
      );
  }

  get hasActiveFilters(): boolean {
    return (
      this.selectedBlockId != null ||
      this.selectedSpeciesId != null ||
      this.selectedSubPlotId != null ||
      !!this.selectedDate?.trim()
    );
  }

  clearFilters(): void {
    if (this.isLoading || !this.hasActiveFilters) {
      return;
    }

    this.selectedBlockId = null;
    this.selectedSpeciesId = null;
    this.selectedSubPlotId = null;
    this.selectedDate = null;
    this.currentPage = 0;

    this.loadCurrentPage();
  }

  loadSpeciesFilter(): void {
    this.speciesFilter$ = this.speciesService
      .getAllSpeciesFilter()
      .pipe(
        map((response: any) => {
          const list = response?.content ?? [];

          return list.map((s: any) => ({
            ...s,
            id_species: s.id ?? s.id_species ?? s.idSpecies ?? null,
          }) as SpeciesFilter);
        }),
        catchError(() => of([] as SpeciesFilter[])),
      );
  }

  onSpeciesChange(value: any): void {
    // Réservé à une éventuelle logique lors du changement d'espèce.
  }

  loadSubPlotFilter(): void {
    this.subPlotFilter$ = this.subPlotService
      .getAllSubPlotWebFilter()
      .pipe(
        catchError(() => of([] as SubPlotWebFilter[])),
      );
  }

  trackById(_: number, item: PlantationView): any {
    return item?.idPlantation ?? _;
  }

  search(): void {
    this.currentPage = 0;
    this.loadCurrentPage();
  }

  changePageSize(size: number): void {
    if (this.pageSize === size) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 0;
    this.loadCurrentPage();
  }

  loadCurrentPage(): void {
    const requestId = ++this.requestId;

    const hasFilters =
      this.selectedBlockId != null ||
      this.selectedSubPlotId != null ||
      this.selectedSpeciesId != null ||
      !!this.selectedDate?.trim();

    this.isLoading = true;
    this.errorMessage = '';

    const request$ = hasFilters
      ? this.plantationService.searchPlantations(
          this.selectedBlockId,
          this.selectedSubPlotId,
          this.selectedSpeciesId,
          this.selectedDate?.trim() || null,
          this.currentPage,
          this.pageSize,
        )
      : this.plantationService.getAllPlantations(
          this.currentPage,
          this.pageSize,
        );

    request$
      .pipe(
        finalize(() => {
          if (requestId === this.requestId) {
            this.isLoading = false;
            this.cdr.detectChanges();
          }
        }),
      )
      .subscribe({
        next: (response) => {
          if (requestId !== this.requestId) {
            return;
          }

          this.totalElements = response.page.totalElements;
          this.totalPages = response.page.totalPages;
          this.currentPage = response.page.number;
          this.pageSize = response.page.size;
          this.plantations$ = of(response.content ?? []);
        },
        error: (error) => {
          if (requestId !== this.requestId) {
            return;
          }

          this.errorMessage = this.getErrorMessage(error);
          this.plantations$ = of([]);
        },
      });
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le backend est démarré.';
    }

    if (error.status === 403 || error.status === 401) {
      return 'Erreur CORS / autorisation. Vérifiez la configuration du backend.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${
      error.message || 'Problème de connexion'
    }`;
  }

  formatDate(date?: string | null): string {
    if (!date) return '';
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy') || '';
  }

  formatDateTime(date?: string | null): string {
    if (!date) return '';
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  formatNumber(value?: number | null): string {
    if (value == null) return '';
    return new DecimalPipe('fr').transform(value, '1.2-2') || '';
  }

  getStatusText(p?: PlantationView): string {
    if (!p) return '';
    if (p.plantationIsDeleted) return 'Supprimée';
    return p.plantationStatus ? 'Vivante' : 'Morte';
  }
}