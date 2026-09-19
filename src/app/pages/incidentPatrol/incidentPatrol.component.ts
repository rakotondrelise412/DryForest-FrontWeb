import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { catchError, finalize, Observable, of } from "rxjs";
import { IncidentPatrol } from "../../models/incidentPatrol";
import { IncidentPatrolService } from "../../services/incidentPatrol.service";

@Component({
  selector: 'app-incident-patrol',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './incidentPatrol.component.html',
  styleUrls: ['./incidentPatrol.component.css']
})
export class IncidentPatrolComponent implements OnInit{
  incidentPatrol$: Observable<IncidentPatrol[]> = of([]);

  isLoading = false;
  errorMessage = '';

  constructor( private incidentPatrolService: IncidentPatrolService){}

  ngOnInit(): void{
    this.loadIncidentPatrol();
  }

  loadIncidentPatrol(): void{
    this.isLoading = true;
    this.errorMessage = '';
    this.incidentPatrol$ = this.incidentPatrolService.getAll().pipe(
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as IncidentPatrol[])
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

  trackById(index: number, item: IncidentPatrol): number {
    return item.id_incident_patrol;
  }

  private normalizeSeverity(severity: string): string {
    return (severity || '')
      .trim()
      .normalize('NFD')                        // décompose les caractères accentués
      .replace(/[\u0300-\u036f]/g, '')         // supprime les diacritiques
      .toLowerCase();
  }

  getSeverityClass(severity: string): string {
    switch (this.normalizeSeverity(severity)) {
      case 'faible':    return 'badge--severity-low';
      case 'moyen':     return 'badge--severity-medium';
      case 'eleve':     return 'badge--severity-high';   // Élevé → eleve
      case 'critique':  return 'badge--severity-critical';
      default:          return 'badge--severity-unknown';
    }
  }

  getSeverityIcon(severity: string): string {
    switch (this.normalizeSeverity(severity)) {
      case 'faible':    return 'info';
      case 'moyen':     return 'warning';
      case 'eleve':     return 'error';
      case 'critique':  return 'dangerous';
      default:          return 'help_outline';
    }
  }
}
