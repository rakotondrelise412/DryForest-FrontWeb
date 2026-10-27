
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { SpeciesFilter } from '../models/speciesFilter.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class SpeciesService {
  private readonly endPoint = 'api/species';

  constructor(private readonly apiService: ApiService) {}

 
  getAllSpeciesFilter(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<SpeciesFilter>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    return this.apiService.get<PageResponse<SpeciesFilter>>(
      `${this.endPoint}?${params.toString()}`
    );
  }
}
