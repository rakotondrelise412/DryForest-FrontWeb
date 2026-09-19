import { Injectable } from "@angular/core";
import { ApiService } from "../core/services/api.service";
import { Observable } from "rxjs";
import { SubPlot, SubPlotWebFilter } from "../models/subPlotWebFilter.model";


@Injectable({
    providedIn: 'root'
})
export class SubPlotService{
    private endPoint = 'api/subplot/subPlotWebFilter';
    private all = 'api/subplot/all';

    constructor(private apiService: ApiService){}

    getAllSubPlotWebFilter(): Observable<SubPlotWebFilter[]>{
        return this.apiService.get<SubPlotWebFilter[]>(this.endPoint);
    }

    getAllSubPlot(): Observable<SubPlot[]>{
      return this.apiService.get<SubPlot[]>(this.all);
    }
}
