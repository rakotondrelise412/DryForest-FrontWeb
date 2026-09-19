
export interface ObservationPatrol{
  id_observation_patrol: number;
  date_observation?: string | null;
  description: string;
  patrolGroup: string;
  zone: string;
  user: string;
  location?: {
    type?: string;
    coordinates?: number[];
  };
}
