import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonPage, Person } from '../models/person.model';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  private endpoint = 'api/persons';

  constructor(private apiService: ApiService) {}

  getAllPersons(page: number = 0, size: number = 10): Observable<PersonPage> {
    return this.apiService.get<PersonPage>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  getPersonById(id: number): Observable<Person> {
    return this.apiService.get<Person>(`${this.endpoint}/${id}`);
  }

  getPersonsByRole(idRole: number, page = 0, size = 10): Observable<PersonPage> {
    return this.apiService.get<PersonPage>(
      `${this.endpoint}/role/${idRole}?page=${page}&size=${size}`,
    );
  }
}
