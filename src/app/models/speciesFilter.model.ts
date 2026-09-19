
export interface SpeciesFilter{
    id: number;
    id_species?: number,
    mg_name: string,
    fr_name: string,
    en_name: string,
    scientific_name: string
}


export interface SpeciesCarbon{
  speciesId: number;
  speciesName: string;
  totalCarbon: number
}

export interface SpeciesStat{
  id_species: number;
  scientific_name: string;
  mg_name: string;
  fr_name: string;
  en_name: string;
  diameter: number;
  height: number;
  carbon_sequestered: number;
  date_reforestation: string;
  id_plantation: number;
}
