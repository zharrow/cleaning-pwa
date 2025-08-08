import { BaseModel } from './base.model';

export interface Room extends BaseModel {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}