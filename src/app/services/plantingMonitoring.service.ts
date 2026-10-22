
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { SpeciesStat } from '../models/speciesFilter.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlantingMonitoringService {
  private api = 'api/planting_monitoring';

  private speciesStatistic = `${this.api}/speciesStat`;

  private speciesStatByDate =
    `${this.api}/species/statistics/by-reforestation-date`;

  constructor(private apiService: ApiService) {}

  getSpeciesStat(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<SpeciesStat>> {
    return this.apiService.get<PageResponse<SpeciesStat>>(
      `${this.speciesStatistic}?page=${page}&size=${size}`
    );
  }

  getSpeciesStatByDate(
    startDate: string,
    endDate: string,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<SpeciesStat>> {
    const url =
      `${this.speciesStatByDate}` +
      `?startDate=${startDate}` +
      `&endDate=${endDate}` +
      `&page=${page}` +
      `&size=${size}`;

    return this.apiService.get<PageResponse<SpeciesStat>>(url);
  }
}
