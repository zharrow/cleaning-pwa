import { BaseModel } from './base.model';

export interface Room extends BaseModel {
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}