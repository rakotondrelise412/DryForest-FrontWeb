import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { IncidentPatrol } from '../../models/incidentPatrol';
import { PageResponse } from '../../models/page-response.model';
import { IncidentPatrolService } from '../../services/incidentPatrol.service';
import { PaginationComponent } from '../../shared/components/pagination/pagination';

@Component({
  selector: 'app-incident-patrol',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './incidentPatrol.component.html',
  styleUrls: ['./incidentPatrol.component.css'],
})
export class IncidentPatrolComponent {
  incidentPatrols$: Observable<IncidentPatrol[]> = of([]);

  isLoading = false;
  errorMessage = '';

  currentPage = this.getSavedPage();
  pageSize = this.getSavedPageSize();

  totalElements = 0;
  totalPages = 0;

  constructor(private readonly incidentPatrolService: IncidentPatrolService) {
    this.loadIncidentPatrol();
  }

  private getSavedPage(): number {
    const page = Number(localStorage.getItem('incidentPatrolCurrentPage'));

    return Number.isInteger(page) && page >= 0 ? page : 0;
  }

  private getSavedPageSize(): number {
    const savedSize = localStorage.getItem('incidentPatrolPageSize');

    const size = Number(savedSize);

    const allowedSizes = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    return allowedSizes.includes(size) ? size : 10;
  }

  loadIncidentPatrol(page: number = this.currentPage): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.currentPage = page;

    localStorage.setItem('incidentPatrolCurrentPage', String(this.currentPage));

    localStorage.setItem('incidentPatrolPageSize', String(this.pageSize));

    this.incidentPatrols$ = this.incidentPatrolService.getAll(this.currentPage, this.pageSize).pipe(
      tap((response: PageResponse<IncidentPatrol>) => {
        const incidents = response.content ?? [];

        this.totalElements = incidents.length;

        this.totalPages = response.page.totalPages;
        this.currentPage = response.page.number;
        this.pageSize = response.page.size;

        localStorage.setItem('incidentPatrolCurrentPage', String(this.currentPage));

        localStorage.setItem('incidentPatrolPageSize', String(this.pageSize));
      }),

      map((response: PageResponse<IncidentPatrol>) => response.content ?? []),

      catchError((error) => {
        console.error('Erreur lors du chargement des incidents :', error);

        this.errorMessage = this.getErrorMessage(error);
        this.totalElements = 0;
        this.totalPages = 0;

        return of([] as IncidentPatrol[]);
      }),

      finalize(() => {
        this.isLoading = false;
      }),
    );
  }

  previousPage(): void {
    if (this.isLoading || this.currentPage <= 0) {
      return;
    }

    this.loadIncidentPatrol(this.currentPage - 1);
  }

  nextPage(): void {
    if (this.isLoading || this.currentPage >= this.totalPages - 1) {
      return;
    }

    this.loadIncidentPatrol(this.currentPage + 1);
  }

  changePageSize(size: number): void {
    const allowedSizes = [5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

    if (this.isLoading || !allowedSizes.includes(size) || size === this.pageSize) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 0;

    localStorage.setItem('incidentPatrolPageSize', String(size));

    localStorage.setItem('incidentPatrolCurrentPage', '0');

    this.loadIncidentPatrol(0);
  }

  trackById(index: number, item: IncidentPatrol): number {
    return item.id_incident_patrol;
  }

  private normalizeSeverity(severity: string | null | undefined): string {
    return (severity || '')
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  getSeverityClass(severity: string | null | undefined): string {
    switch (this.normalizeSeverity(severity)) {
      case 'faible':
        return 'badge--severity-low';

      case 'moyen':
        return 'badge--severity-medium';

      case 'eleve':
        return 'badge--severity-high';

      case 'critique':
        return 'badge--severity-critical';

      default:
        return 'badge--severity-unknown';
    }
  }

  isHighSeverity(severity: string | null | undefined): boolean {
    const severityClass = this.getSeverityClass(severity);

    return severityClass === 'badge--severity-high' || severityClass === 'badge--severity-critical';
  }

  getSeverityIcon(severity: string | null | undefined): string {
    switch (this.normalizeSeverity(severity)) {
      case 'faible':
        return 'info';

      case 'moyen':
        return 'warning';

      case 'eleve':
        return 'error';

      case 'critique':
        return 'dangerous';

      default:
        return 'help_outline';
    }
  }

  getImageUrl(image: string | null | undefined): string {
    if (!image) {
      return '';
    }

    const baseUrl = 'http://localhost:8082';
    const normalizedPath = image.replace(/\\/g, '/');

    return `${baseUrl}/${normalizedPath.replace(/^\/+/, '')}`;
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue.';
    }

    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez que le serveur est démarré et que son URL est correcte.';
    }

    if (error.status === 401 || error.status === 403) {
      return 'Accès refusé. Vérifiez votre authentification, vos autorisations et la configuration CORS.';
    }

    return `Erreur ${error.status || 'inconnue'} : ${error.message || 'Problème de connexion.'}`;
  }
}
