import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import {
  AnimalObservedByZone,
  AnimalTracking
} from '../models/animalTracking.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalTrackingService {

  private readonly api = 'api/animal_tracking';

  private readonly observedAnimalsByZone =
    `${this.api}/observed-animals-by-zone`;

  constructor(private apiService: ApiService) {}

  getAnimalTrackings(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<AnimalTracking>> {
    return this.apiService.get<PageResponse<AnimalTracking>>(
      `${this.api}?page=${page}&size=${size}`
    );
  }

  getAnimalObservedByZone(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<AnimalObservedByZone>> {
    return this.apiService.get<PageResponse<AnimalObservedByZone>>(
      `${this.observedAnimalsByZone}?page=${page}&size=${size}`
    );
  }
}