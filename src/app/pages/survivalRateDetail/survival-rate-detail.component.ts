import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

import { PlantationService } from '../../services/plantation.service';
import { PlantationBlockSurvivalRate } from '../../models/plantation.model';

@Component({
  selector: 'app-survival-rate-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './survival-rate-detail.component.html',
  styleUrls: ['./survival-rate-detail.component.css']
})
export class SurvivalRateDetailComponent {

  data$: Observable<PlantationBlockSurvivalRate[]> = of([]);
  loading = false;
  errorMessage = '';

  constructor(private plantationService: PlantationService) {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.errorMessage = '';

    this.data$ = this.plantationService.getSurvivalRateByBlockSubPlotAndSpecies().pipe(
      finalize(() => (this.loading = false)),
      catchError(error => {
        console.error('Erreur chargement survival rate', error);
        this.errorMessage = 'Impossible de charger les données de survie.';
        return of([] as PlantationBlockSurvivalRate[]);
      })
    );
  }

  trackByBlockId(index: number, item: PlantationBlockSurvivalRate): number | undefined {
    return item.blockId;
  }

  trackBySubPlotId(index: number, item: any): number | undefined {
    return item.subPlotId;
  }

  trackBySpeciesId(index: number, item: any): number | undefined {
    return item.speciesId;
  }
}
