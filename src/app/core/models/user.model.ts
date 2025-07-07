import { BaseModel } from './base.model';

export interface User extends BaseModel {
  firebaseUid: string;
  fullName: string;
  role: UserRole;
  email?: string;
}

export enum UserRole {
  GERANTE = 'GERANTE',
}