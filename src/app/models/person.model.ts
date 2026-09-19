import { Gender } from "./gender.model";
import { Role } from "./role.model";
import { Site } from "./site.model";

export interface Person {
  id_person: number;
  last_name: string;
  first_name: string;
  gender?: Gender;  
  email?: string;
  phone_number?: string;
  address: string;
  created_at: string; 
  updated_at: string;
  is_deleted: boolean;
  role?: Role; 
  site?: Site;      
}