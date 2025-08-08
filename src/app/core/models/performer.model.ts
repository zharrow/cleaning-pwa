import { BaseModel } from './base.model';

export interface Performer extends BaseModel {
  id: string;
  name: string;
  isActive: boolean;
}