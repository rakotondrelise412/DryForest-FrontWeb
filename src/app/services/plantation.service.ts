
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
  private api = 'api/plantation';
  private endpoint = this.api + '/plantationsByPlantationBlock';
  private endpointSearch = this.api + '/plantationsByCriteria';
  private endpointStatusByYear = this.api + '/by_year_status';
  private speciesCarbonEndpoint = this.api + '/carbon_by_species';
  private survivalRate = this.api + '/survival_rate';
  private surviavalRateGlobal = this.api + '/survival_global';
  private survivalDetail =
    `${this.api}/survival_rate_by_block_subplot_species`;

  constructor(private apiService: ApiService) {}

  getAllPlantations(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<PlantationView>> {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size)
    });

    return this.apiService.get<PageResponse<PlantationView>>(
      `${this.endpoint}?${params.toString()}`
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
    return this.apiService.get<SurvivalRate[]>(this.survivalRate);
  }

  getSurvivalRateGlobal(): Observable<SurvivalRate | null> {
    return this.apiService.get<SurvivalRate>(this.surviavalRateGlobal);
  }

  getSurvivalRateByBlockSubPlotAndSpecies():
    Observable<PlantationBlockSurvivalRate[]> {
    return this.apiService.get<PlantationBlockSurvivalRate[]>(
      this.survivalDetail
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
    const params = new URLSearchParams();

    if (
      idPlantationBlock != null &&
      !Number.isNaN(Number(idPlantationBlock))
    ) {
      params.append('id_plantation_block', String(idPlantationBlock));
    }

    if (
      idSubPlot != null &&
      !Number.isNaN(Number(idSubPlot))
    ) {
      params.append('id_sub_plot', String(idSubPlot));
    }

    if (
      idSpecies != null &&
      !Number.isNaN(Number(idSpecies))
    ) {
      params.append('id_species', String(idSpecies));
    }

    if (datePlantation?.trim()) {
      params.append('date_plantation', datePlantation);
    }

    params.append('page', String(page));
    params.append('size', String(size));

    const url = `${this.endpointSearch}?${params.toString()}`;

    console.debug('[PlantationService] GET', url);

    return this.apiService.get<PageResponse<PlantationView>>(url);
  }
}
