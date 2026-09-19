import { Person } from "./person.model";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  id_user: number;
  username: string;
  token:string;
  expires_at: string;
  person: Person;
}