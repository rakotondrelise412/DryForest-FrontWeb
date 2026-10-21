
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PersonPage } from '../models/person.model';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private endpoint = 'api/persons';

  constructor(private apiService: ApiService) {}

  getAllPersons(
    page: number = 0,
    size: number = 10
  ): Observable<PersonPage> {
    return this.apiService.get<PersonPage>(
      `${this.endpoint}?page=${page}&size=${size}`
    );
  }
}
