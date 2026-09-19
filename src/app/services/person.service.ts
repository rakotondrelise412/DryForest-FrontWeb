import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Person } from '../models/person.model';
import { ApiService } from '../core/services/api.service';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private endpoint = "api/persons";

  constructor(private apiService: ApiService) { }

  getAllPersons(): Observable<Person[]> {
    return this.apiService.get<Person[]>(this.endpoint);
  }
}