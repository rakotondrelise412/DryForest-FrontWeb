import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ObservationPatrol } from "../../models/observation.model";
import { catchError, finalize, Observable, of } from "rxjs";
import { ObservationService } from "../../services/observationPatrol.service";


@Component({
  selector: 'app-observation-patrol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './observationPatrol.component.html',
  styleUrls: ['./observationPatrol.component.css']
})
export class ObservationPatrolComponent implements OnInit{
  observationPatrol$: Observable<ObservationPatrol[]> = of([]);

  isLoading = false;
  errorMessage = '';

  constructor( private observationPatrolService: ObservationService ){}

  ngOnInit(): void {
    this.loadObservationPatrol();
  }

  loadObservationPatrol(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.observationPatrol$ = this.observationPatrolService.getAll().pipe(
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as ObservationPatrol[]);
      }),
      finalize(() => {
        this.isLoading = false;
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

  trackById(index: number, item: ObservationPatrol): number {
    return item.id_observation_patrol;
  }
}
