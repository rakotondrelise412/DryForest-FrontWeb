import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { Observable } from "rxjs";
import { ZoneWeb } from "../models/zone.model";

@Injectable({
    providedIn: 'root'
})
export class ZoneService{
  private endpoint = 'api/zone';
  private ereaProtected = `${this.endpoint}/totalAreaProtected`;

  constructor(private apiService: ApiService){}

  getZoneWeb(): Observable<ZoneWeb[]>{
    return this.apiService.get<ZoneWeb[]>(this.endpoint);
  }

  getTotalAreaProtected(): Observable<number>{
    return this.apiService.get<number>(this.ereaProtected);
  }
}
