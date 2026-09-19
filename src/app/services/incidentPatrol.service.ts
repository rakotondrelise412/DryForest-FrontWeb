import { CountByType } from './../models/countByType.model';
import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { Observable } from "rxjs";
import { IncidentPatrol } from "../models/incidentPatrol";

@Injectable({
  providedIn: 'root'
})
export class IncidentPatrolService{
  private api = 'api/incidentPatrol';
  private incidentPatCountByType = `${this.api}/countByType`;

  constructor(private apiService: ApiService){}

  getAll(): Observable<IncidentPatrol[]>{
    return this.apiService.get<IncidentPatrol[]>(this.api);
  }

  getIncidentPatCountByType(): Observable<CountByType[]>{
    return this.apiService.get<CountByType[]>(this.incidentPatCountByType);
  }
}
