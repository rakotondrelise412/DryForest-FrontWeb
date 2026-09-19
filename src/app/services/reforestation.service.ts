import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { LatestReforestation, ReforestationCounting } from "../models/reforestation.model";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ReforestationService{
  private endPoint = 'api/reforestation/ref_quantity_by_type_zone';
  private totalLastPlanted = 'api/reforestation/total_planted';
  private latestPlanted = 'api/reforestation/total_last_planted';

  constructor(private apiService: ApiService) {}

  getQuantityByTypeZone(): Observable<ReforestationCounting[]>{
    return this.apiService.get<ReforestationCounting[]>(this.endPoint);
  }

  getTotalPlanted(): Observable<number>{
    return this.apiService.get<number>(this.totalLastPlanted);
  }

  getTotalLatestPlanted(): Observable<LatestReforestation>{
    return this.apiService.get<LatestReforestation>(this.latestPlanted);
  }
}
