import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PlantingMonitoringService } from '../../services/plantingMonitoring.service';
import { SpeciesStat } from '../../models/speciesFilter.model';

@Component({
  selector: 'app-species-stat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './speciesStat.component.html',
  styleUrls: ['./speciesStat.component.css']
})
export class SpeciesStatComponent {
  speciesStat$: Observable<SpeciesStat[]> = of([]);

  isLoading = false;
  errorMessage = '';

  startDate = '';
  endDate = '';

  constructor(private plantingMonitoringService: PlantingMonitoringService) {
    this.loadSpeciesStat();
  }

  loadSpeciesStat(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.speciesStat$ = this.plantingMonitoringService.getSpeciesStat().pipe(
      finalize(() => (this.isLoading = false)),
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as SpeciesStat[]);
      })
    );
  }

  searchByDate(): void {
    if (!this.startDate || !this.endDate) {
      this.errorMessage = 'Veuillez sélectionner la date de début et la date de fin.';
      return;
    }
    if (this.startDate > this.endDate) {
      this.errorMessage = 'La date de début doit être inférieure ou égale à la date de fin.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.speciesStat$ = this.plantingMonitoringService
      .getSpeciesStatByDate(this.startDate, this.endDate).pipe(
        finalize(() => (this.isLoading = false)),
        catchError(err => {
          this.errorMessage = this.getErrorMessage(err);
          return of([] as SpeciesStat[]);
        })
      );
  }

  resetFilters(): void {
    this.startDate = '';
    this.endDate = '';
    this.loadSpeciesStat();
  }

  private getErrorMessage(error: any): string {
    if (!error) return 'Erreur inconnue';
    if (error.status === 0) return 'Spring Boot ne répond pas. Vérifiez que le backend est démarré.';
    if (error.status === 403 || error.status === 401) return 'Erreur CORS / autorisation. Vérifiez la configuration du backend.';
    return `Erreur ${error.status || 'inconnue'} : ${error.message || 'Problème de connexion'}`;
  }

  trackByStat(index: number, item: SpeciesStat): string {
    return `${item.scientific_name}-${item.date_reforestation}-${index}`;
  }
}
