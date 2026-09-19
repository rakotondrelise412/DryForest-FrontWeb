

export interface SubPlotWebFilter{
    id_sub_plot: number,
    name: string
}

export interface SubPlot {
  id_sub_plot: number;
  uuid: string;
  name: string;
  width: number;
  height: number;
  location?: { type?: 'Point'; coordinates?: [number, number] | number[] };
  created_at: string | null;
  updated_at: string | null;
  is_synced: boolean | null;
  is_deleted: boolean | null;
  plantation_block_id: number | null;
}
