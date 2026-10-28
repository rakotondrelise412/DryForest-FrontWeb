import { Injectable } from '@angular/core';
import { ApiService } from '../core/services/api.service';
import { Observable } from 'rxjs';
import { SubPlot, SubPlotWebFilter } from '../models/subPlotWebFilter.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root',
})
export class SubPlotService {
  private readonly api = 'api/subplot';

  private readonly all = `${this.api}/all`;

  private readonly endPoint = `${this.api}/subPlotWebFilter`;

  constructor(private apiService: ApiService) {}

  getAllSubPlotWebFilter(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<SubPlotWebFilter>> {
    return this.apiService.get<PageResponse<SubPlotWebFilter>>(
      `${this.endPoint}?page=${page}&size=${size}`,
    );
  }

  getAllSubPlot(page: number = 0, size: number = 10): Observable<PageResponse<SubPlot>> {
    return this.apiService.get<PageResponse<SubPlot>>(`${this.all}?page=${page}&size=${size}`);
  }
}
