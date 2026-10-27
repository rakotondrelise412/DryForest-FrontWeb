
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { ApiService } from '../core/services/api.service';
import {
  PlantationBlockSurvivalRate,
  PlantationStatusByYear,
  PlantationView,
  SurvivalRate
} from '../models/plantation.model';
import { SpeciesCarbon } from '../models/speciesFilter.model';
import { PageResponse } from '../models/page-response.model';

@Injectable({
  providedIn: 'root'
})
export class PlantationService {
  private readonly api = 'api/plantation';

  private readonly endpoint =
    `${this.api}/plantationsByPlantationBlock`;

  private readonly endpointSearch =
    `${this.api}/plantationsByCriteria`;

  private readonly endpointStatusByYear =
    `${this.api}/by_year_status`;

  private readonly speciesCarbonEndpoint =
    `${this.api}/carbon_by_species`;

  private readonly survivalRate =
    `${this.api}/survival_rate`;

  private readonly survivalRateGlobal =
    `${this.api}/survival_global`;

  private readonly survivalDetail =
    `${this.api}/survival_rate_by_block_subplot_species`;

  constructor(private readonly apiService: ApiService) {}

  private paginationParams(
    page: number,
    size: number
  ): URLSearchParams {
    return new URLSearchParams({
      page: String(page),
      size: String(size)
    });
  }

  
  getAllPlantations(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationView>> {
    const params = this.paginationParams(page, size);

    return this.apiService.get<PageResponse<PlantationView>>(
      `${this.endpoint}?${params.toString()}`
    );
  }


  searchPlantations(
    idPlantationBlock?: number | null,
    idSubPlot?: number | null,
    idSpecies?: number | null,
    datePlantation?: string | null,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationView>> {
    const params = this.paginationParams(page, size);

    if (idPlantationBlock != null) {
      params.set('id_plantation_block', String(idPlantationBlock));
    }

    if (idSubPlot != null) {
      params.set('id_sub_plot', String(idSubPlot));
    }

    if (idSpecies != null) {
      params.set('id_species', String(idSpecies));
    }

    if (datePlantation?.trim()) {
      params.set('date_plantation', datePlantation.trim());
    }

    return this.apiService.get<PageResponse<PlantationView>>(
      `${this.endpointSearch}?${params.toString()}`
    );
  }

  
  getPlantationsByBlockId(
    blockId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationView>> {
    const params = this.paginationParams(page, size);

    return this.apiService.get<PageResponse<PlantationView>>(
      `${this.api}/plantationsByPlantationBlockById/${blockId}?${params.toString()}`
    );
  }


  getPlantationsByBlockAndSubPlot(
    blockId: number,
    subPlotId: number,
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationView>> {
    const params = this.paginationParams(page, size);

    return this.apiService.get<PageResponse<PlantationView>>(
      `${this.api}/plantationsByPlantationBlock/${blockId}/subPlot/${subPlotId}?${params.toString()}`
    );
  }

  
  plantationStatusByYear(): Observable<PlantationStatusByYear[]> {
    return this.apiService.get<PlantationStatusByYear[]>(
      this.endpointStatusByYear
    );
  }

  getCarbonSequesteredBySpecies(): Observable<SpeciesCarbon[]> {
    return this.apiService.get<SpeciesCarbon[]>(
      this.speciesCarbonEndpoint
    );
  }

  
  getSurvivalRate(): Observable<SurvivalRate[]> {
    return this.apiService.get<SurvivalRate[]>(
      this.survivalRate
    );
  }

 
  getSurvivalRateGlobal(): Observable<SurvivalRate | null> {
    return this.apiService.get<SurvivalRate>(
      this.survivalRateGlobal
    );
  }

  
  getSurvivalRateByBlockSubPlotAndSpecies(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationBlockSurvivalRate>> {
    const params = this.paginationParams(page, size);

    return this.apiService.get<
      PageResponse<PlantationBlockSurvivalRate>
    >(`${this.survivalDetail}?${params.toString()}`);
  }

  
  getAllPlantationsMobile<T>(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<T>> {
    const params = this.paginationParams(page, size);

    return this.apiService.get<PageResponse<T>>(
      `${this.api}?${params.toString()}`
    );
  }
}
