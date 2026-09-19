
import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { SpeciesStat } from "../models/speciesFilter.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class PlantingMonitoringService {
  private api = 'api/planting_monitoring';
  private speciesStatistic = `${this.api}/speciesStat`;
  private speciesStatByDate = `${this.api}/species/statistics/by-reforestation-date`;

  constructor(private apiService: ApiService) {}

  getSpeciesStat(): Observable<SpeciesStat[]> {
    return this.apiService.get<SpeciesStat[]>(this.speciesStatistic);
  }

  getSpeciesStatByDate(startDate: string, endDate: string): Observable<SpeciesStat[]> {
    return this.apiService.get<SpeciesStat[]>(
      `${this.speciesStatByDate}?startDate=${startDate}&endDate=${endDate}`
    );
  }
}
