import { IsMongoId } from 'class-validator';

export class CreateSubscriptionDto {
  @IsMongoId()
  coachId: string;
}