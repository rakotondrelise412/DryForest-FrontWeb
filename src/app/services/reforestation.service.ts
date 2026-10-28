import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { LatestReforestation, ReforestationCounting } from "../models/reforestation.model";
import { Observable } from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class ReforestationService{

  private readonly api = 'api/reforestation';
  private readonly endPoint = `${this.api}/ref_quantity_by_type_zone`;
  private readonly totalLastPlanted = `${this.api}/total_planted`;
  private readonly latestPlanted = `${this.api}/total_last_planted`;


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
