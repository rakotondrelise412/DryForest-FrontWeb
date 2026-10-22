
import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { Observable } from 'rxjs';
import { ZoneWeb } from '../models/zone.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {
  private endpoint = 'api/zone';
  private areaProtected = `${this.endpoint}/totalAreaProtected`;

  constructor(private apiService: ApiService) {}

  getZoneWeb(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<ZoneWeb>> {
    return this.apiService.get<PageResponse<ZoneWeb>>(
      `${this.endpoint}?page=${page}&size=${size}`
    );
  }

  getTotalAreaProtected(): Observable<number> {
    return this.apiService.get<number>(this.areaProtected);
  }
}
