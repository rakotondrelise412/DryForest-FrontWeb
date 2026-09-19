
export interface IncidentPatrol{
  id_incident_patrol: number;
  datetime_incident: string | null;
  location?: {
    type?: string;
    coordinates?: number[];
  };
  description: string;
  image: string;
  patrolGroup: string;
  users: string;
  zone: string;
  plantationBlock: string;
  severity: string;
}
