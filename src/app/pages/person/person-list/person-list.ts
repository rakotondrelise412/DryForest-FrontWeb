import { Component } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PersonService } from '../../../services/person.service';
import { Person } from '../../../models/person.model';

@Component({
  selector: 'app-person-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './person-list.html',
  styleUrls: ['./person-list.css']
})
export class PersonListComponent {
  persons$: Observable<Person[]> = of([]);
  isLoading = false;
  errorMessage = '';
  
  constructor(private personService: PersonService) { 
    this.loadPersons();
  }

  loadPersons(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.persons$ = this.personService.getAllPersons().pipe(
      finalize(() => {
        this.isLoading = false;
      }),
      catchError(err => {
        this.errorMessage = this.getErrorMessage(err);
        return of([] as Person[]);
      })
    );
  }

  private getErrorMessage(error: any): string {
    if (!error) {
      return 'Erreur inconnue';
    }

    // Erreur réseau / Spring Boot non démarré
    if (error.status === 0) {
      return 'Spring Boot ne répond pas. Vérifiez :';
    }
    
    // Erreur CORS
    if (error.status === 403 || error.status === 401) {
      return 'Erreur CORS. Ajoutez dans Spring Boot PersonController : @CrossOrigin(origins = "http://localhost:4200")';
    }
    
    // Erreur générique
    return `Erreur ${error.status || 'inconnue'} : ${error.message || 'Problème de connexion'}`;
  }

  getFullName(person: Person): string {
    return `${person.first_name} ${person.last_name}`;
  }
  
  formatNumber(value: number): string {
    return new DecimalPipe('fr').transform(value, '1.4-6') || '';
  }

  formatDate(date: string): string {
    return new DatePipe('fr').transform(date, 'dd/MM/yyyy HH:mm') || '';
  }

}