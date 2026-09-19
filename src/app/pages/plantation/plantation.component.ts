import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, finalize, map, tap } from 'rxjs/operators';

import { PlantationService } from '../../services/plantation.service';
import { PlantationView } from '../../models/plantation.model';
import { PlantationBlock } from '../../models/plantationBlock.model';
import { PlantationBlockService } from '../../services/plantationBlock.service';
import { SpeciesFilter } from '../../models/speciesFilter.model';
import { SpeciesService } from '../../services/species.service';
import { SubPlotService } from '../../services/subPlot.service';
import { SubPlotWebFilter } from '../../models/subPlotWebFilter.model';

@Component({
  selector: 'app-plantation-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './plantation.component.html',
  styleUrls: ['./plantation.component.css'] 
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

  isLoading = false;
  errorMessage = '';

  constructor(
                private plantationService: PlantationService,
                private plantationBlockService: PlantationBlockService,
                private speciesService: SpeciesService,
                private subPlotService: SubPlotService
            ) {
      this.loadPlantations();
      this.loadPlantationBlock();
      this.loadSpeciesFilter();
      this.loadSubPlotFilter();
  }

  loadPlantations(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.plantations$ = this.plantationService.getAllPlantations().pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as PlantationView[]);
      })
    );
  }

  loadPlantationBlock(): void {
    this.plantationBlock$ = this.plantationBlockService.getAllPlantationBlocks().pipe(
        catchError(err => {
            console.error('Erreur lors de la recuperation des plantation-block', err);
            return of([] as PlantationBlock[]);
        })
    )
  }

  loadSpeciesFilter(): void {
    this.speciesFilter$ = this.speciesService.getAllSpeciesFilter().pipe(
      // list: any[] car la shape côté API peut varier; on normalise ensuite
      map((list: any[]) => list.map(s => {
        // si l'API renvoie `id`, on crée `id_species` pour garder la logique existante
        const id = s.id ?? s.id_species ?? s.idSpecies ?? null;
        return {
          ...s,
          id_species: id
        } as SpeciesFilter;
      })),
      tap(list => console.debug('[PlantationList] species list (normalized):', list)),
      catchError(err => {
        console.error('Erreur lors de la recuperation des espèces', err);
        return of([] as SpeciesFilter[]);
      })
    );
  }

  onSpeciesChange(value: any) {
    console.debug('[PlantationList] species changed ->', value, typeof value);
  }

  loadSubPlotFilter(): void{
    this.subPlotFilter$ = this.subPlotService.getAllSubPlotWebFilter().pipe(
        catchError(err => {
            console.error('Erreur lors de la récuperation des placettes', err);
            return of([] as SubPlotWebFilter[]);
        })
    )
  }

  trackById(_: number, item: PlantationView): any {
    return item?.idPlantation ?? _;
  }

  search(): void {
    // DEBUG : affiche les valeurs qui vont être envoyées
    console.debug('[PlantationList] before search ->', {
      selectedBlockId: this.selectedBlockId,
      selectedSubPlotId: this.selectedSubPlotId,
      selectedSpeciesId: this.selectedSpeciesId,
      selectedDate: this.selectedDate
    });

    this.isLoading = true;
    this.errorMessage = '';

    // Force conversion des ids en number ou null (évite "string" ou NaN)
    const blk = this.selectedBlockId != null ? Number(this.selectedBlockId) : null;
    const sp  = this.selectedSubPlotId != null ? Number(this.selectedSubPlotId) : null;
    const spe = this.selectedSpeciesId != null ? Number(this.selectedSpeciesId) : null;
    const dt  = (this.selectedDate && this.selectedDate.trim() !== '') ? this.selectedDate : null;

    console.debug('[PlantationList] normalized ->', { blk, sp, spe, dt });

    this.plantations$ = this.plantationService.searchPlantations(blk, sp, spe, dt).pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as PlantationView[]);
      })
    );
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

    return `Erreur ${error.status || 'inconnue'} : ${error.message || 'Problème de connexion'}`;
  }

  formatDate(date?: string | null): string {
    if (!date) { return ''; }
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy') || '';
  }

  formatDateTime(date?: string | null): string {
    if (!date) { return ''; }
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

  formatNumber(value?: number | null): string {
    if (value === null || value === undefined) { return ''; }
    return new DecimalPipe('fr').transform(value, '1.0-4') || '';
  }

  getStatusText(p?: PlantationView): string {
    if (!p) { return ''; }
    if (p.plantationIsDeleted) { return 'Supprimée'; }
    return p.plantationStatus ? 'Vivante' : 'Morte';
  }
}
