import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { ObservationPatrol } from "../models/observation.model";
import { Observable } from "rxjs";
import { CountByType } from "../models/countByType.model";
import { PageResponse } from "../models/page-response.model";


@Injectable({
  providedIn: 'root'
})
export class ObservationService{
  private readonly api = 'api/observationPatrol';
  private readonly observationPatCountByType = `${this.api}/countByType`;

  constructor(private apiService: ApiService){}


getAll(
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<ObservationPatrol>> {
    return this.apiService.get<PageResponse<ObservationPatrol>>(
      `${this.api}?page=${page}&size=${size}`
    );
  }

  getObservationPatCountByType(): Observable<CountByType[]>{
    return this.apiService.get<CountByType[]>(this.observationPatCountByType);
  }
}
