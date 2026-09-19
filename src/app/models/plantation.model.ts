

export interface PlantationView {
    idPlantation?: number;
    plantationUuid?: string;
    diameter?: number | null;
    height?: number | null;
    carbonSequestered?: number | null;
    image?: string | null;
    datePlantation?: string | null;
    plantNumber?: string | null;
    plantationStatus?: boolean | null;
    plantationCreatedAt?: string | null;
    plantationUpdatedAt?: string | null;
    plantationIsSynced?: boolean | null;
    plantationIsDeleted?: boolean | null;
    idSpecies?: number | null;
    speciesName?: string | null;
    idSubPlot?: number | null;
    idReforestation?: number | null;
    subPlotName?: string | null;
    plantationBlockName?: string | null;
    idPlantationBlock?: number | null;
  }


  export interface PlantationStatusByYear{
    year: number;
    aliveCount: number;
    deadCount: number;
    totalCount: number;
  }

  export interface SurvivalRate {
    year: number;
    alivePercentage: number;
    deadPercentage: number;
    autoGenerationPercentage: number;
  }

  export interface SpeciesSurvivalRate {
  speciesId?: number;
  speciesName?: string;
  aliveCount?: number;
  deadCount?: number;
  totalCount?: number;
  aliveRate?: number;
  deadRate?: number;
}

export interface SubPlotSurvivalRate {
  subPlotId?: number;
  subPlotName?: string;
  speciesStats?: SpeciesSurvivalRate[];
}

export interface PlantationBlockSurvivalRate {
  blockId?: number;
  blockName?: string;
  subPlots?: SubPlotSurvivalRate[];
}
