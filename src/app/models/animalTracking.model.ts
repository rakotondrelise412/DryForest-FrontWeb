
export interface AnimalObservedByZone{
  idZone: number;
  zoneName: string;
  idAnimal: number;
  animalName: string;
  totalObserved: number;
}


export interface AnimalTracking {
  id_animal_tracking: number;
  uuid: string;

  location: {
    coordinates: [number, number];
    type: string;
  };

  date_tracking: string;
  have_seen: boolean;
  description: string;

  created_at: string;
  updated_at: string;

  id_plantation_block: number;

  animal_tracking_details: AnimalTrackingDetail[];

  _synced: boolean;
}

export interface AnimalTrackingDetail {
  id_animal_tracking_detail: number;
  uuid: string;

  created_at: string;
  updated_at: string;

  id_animal: number;
  id_animal_tracking: number;
  have_seen: boolean;
  _synced: boolean;
}
