import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { PlantationBlock, PlantationBlocks } from '../models/plantationBlock.model';

@Injectable({
    providedIn: 'root'
})
export class PlantationBlockService{
    private endPoint = 'api/plantationBlock/filterPlantationBlock';
    private all = 'api/plantationBlock/all';

    constructor(private apiService: ApiService) {}

    getAll(): Observable<PlantationBlocks[]>{
      return this.apiService.get<PlantationBlocks[]>(this.all);
    }

    getAllPlantationBlocks(): Observable<PlantationBlock[]>{
        return this.apiService.get<PlantationBlock[]>(this.endPoint);
    }
}
