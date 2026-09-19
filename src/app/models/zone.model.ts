// src/app/models/zone-web.model.ts
export interface ZoneWeb {
  id_zone: number;
  name: string;
  area: number;
  geom?: { type?: string; coordinates?: any };
  id_type_zone?: number;
}
