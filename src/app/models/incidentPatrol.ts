
export interface IncidentPatrol {
  id_incident_patrol: number;
  uuid?: string;
  datetime_incident?: string;
  description?: string;
  image?: string;
  severity?: string;
  type_incident_patrol?: string;
  patrolGroup?: string;
  users?: string;
  zone?: string;
  plantationBlock?: string;

  location?: {
    type: string;
    coordinates: number[];
  };
}