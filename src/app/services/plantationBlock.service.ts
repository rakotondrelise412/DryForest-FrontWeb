import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { PlantationBlock, PlantationBlocks } from '../models/plantationBlock.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root',
})
export class PlantationBlockService {
  private readonly api = 'api/plantationBlock';
  private readonly endPoint = `${this.api}/filterPlantationBlock`;
  private readonly all = `${this.api}/all`;

  constructor(private apiService: ApiService) {}

  getAll(page: number = 0, size: number = 10): Observable<PageResponse<PlantationBlocks>> {
    return this.apiService.get<PageResponse<PlantationBlocks>>(
      `${this.all}?page=${page}&size=${size}`,
    );
  }

  getAllPlantationBlocks(
    page: number = 0,
    size: number = 10,
  ): Observable<PageResponse<PlantationBlock>> {
    return this.apiService.get<PageResponse<PlantationBlock>>(
      `${this.endPoint}?page=${page}&size=${size}`,
    );
  }
}
