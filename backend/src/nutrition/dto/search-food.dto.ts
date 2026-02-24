import { IsString, MinLength } from 'class-validator';

export class SearchFoodDto {
  @IsString()
  @MinLength(2)
  query: string;
}