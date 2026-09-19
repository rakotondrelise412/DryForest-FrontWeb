import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { Observable } from "rxjs";
import { AnimalObservedByZone } from "../models/animalTracking.model";

@Injectable({
  providedIn: 'root'
})
export class AnimalTrackingService{
  private api = 'api/animal_tracking';
  private observedAnimalsByZone = `${this.api}/observed-animals-by-zone`;

  constructor(private apiService: ApiService){}

  getAnimalObservedByZone(): Observable<AnimalObservedByZone[]>{
    return this.apiService.get<AnimalObservedByZone[]>(this.observedAnimalsByZone);
  }
}
