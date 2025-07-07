import { BaseModel } from './base.model';

export interface Performer extends BaseModel {
  name: string;
  isActive: boolean;
}