import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { ObservationPatrol } from "../models/observation.model";
import { Observable } from "rxjs";
import { CountByType } from "../models/countByType.model";


@Injectable({
  providedIn: 'root'
})
export class ObservationService{
  private api = 'api/observationPatrol';
  private observationPatCountByType = `${this.api}/countByType`;

  constructor(private apiService: ApiService){}

  getAll(): Observable<ObservationPatrol[]>{
    return this.apiService.get<ObservationPatrol[]>(this.api);
  }

  getObservationPatCountByType(): Observable<CountByType[]>{
    return this.apiService.get<CountByType[]>(this.observationPatCountByType);
  }
}
