import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { Observable } from "rxjs";
import { SpeciesFilter } from "../models/speciesFilter.model";


@Injectable({
    providedIn: 'root'
})
export class SpeciesService{
    private endPoint = 'api/species';

    constructor(private apiService: ApiService){}

    getAllSpeciesFilter(): Observable<SpeciesFilter[]>{
        return this.apiService.get<SpeciesFilter[]>(this.endPoint);
    }
}
