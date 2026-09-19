import { CommonModule } from "@angular/common";
import { Component, OnInit, TemplateRef } from "@angular/core";
import { AnimalObservedByZone } from "../../models/animalTracking.model";
import { catchError, finalize, Observable, of } from "rxjs";
import { AnimalTrackingService } from "../../services/animalTracking.service";


@Component({
  selector: 'animal-tracking-observed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './animalTracking.component.html',
  styleUrls: ['./animalTracking.component.css']
})
export class AnimalTrackingComponent implements OnInit{
  animalObserved$: Observable<AnimalObservedByZone[]> = of([]);

  isLoading = true;
  errorMessage = '';

  constructor(private animalTrackingService: AnimalTrackingService){}


  ngOnInit(): void {
    console.log('AnimalComponent chargé');
    this.loadAnimalObservedByZone();
  }

  loadAnimalObservedByZone(): void {
    console.log('Appel du service');
    this.isLoading = true;
    this.errorMessage = '';
    this.animalObserved$ = this.animalTrackingService.getAnimalObservedByZone().pipe(
      catchError(err => {
        console.error('Erreur API', err);
        this.errorMessage = this.getErrorMessage(err);
        return of([] as AnimalObservedByZone[]);
      }),
      finalize(() => {
        this.isLoading = false;
      })
    )
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
}
