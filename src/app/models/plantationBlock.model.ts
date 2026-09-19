export interface PlantationBlock {
    id_plantation_block: number;
    name: string;
}

export interface PlantationBlocks{
  id_plantation_block: number;
  uuid: string;
  name: string;
  width: number;
  heigth: number;
  nb_sub_plot: number;
  geom?: { type?: string; coordinates?: any };
  created_at: string | null;
  updated_at: string | null;
  is_synced: boolean | null;
  is_deleted: boolean | null;
  id_zone: number | null;
}
