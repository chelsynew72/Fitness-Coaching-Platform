import { IsMongoId } from 'class-validator';

export class AssignPlanDto {
  @IsMongoId()
  clientId: string;
}