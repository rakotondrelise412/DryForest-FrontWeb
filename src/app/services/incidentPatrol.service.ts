
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import { IncidentPatrol } from '../models/incidentPatrol';
import { CountByType } from '../models/countByType.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentPatrolService {

  private readonly api = 'api/incidentPatrol';
  private readonly incidentPatCountByType = `${this.api}/countByType`;

  constructor(private readonly apiService: ApiService) {}

 
  getAll(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<IncidentPatrol>> {
    return this.apiService.get<PageResponse<IncidentPatrol>>(
      `${this.api}?page=${page}&size=${size}`
    );
  }

 
  getIncidentPatCountByType(): Observable<CountByType[]> {
    return this.apiService.get<CountByType[]>(
      this.incidentPatCountByType
    );
  }
}
