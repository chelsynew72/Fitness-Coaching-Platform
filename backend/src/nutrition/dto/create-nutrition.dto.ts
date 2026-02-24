import {
  IsDateString,
  IsArray,
  IsOptional,
  IsNumber,
  IsString,
  ValidateNested,
  IsEnum,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FoodDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  brand?: string;

  @IsString()
  @IsOptional()
  quantity?: string;

  @IsNumber()
  @Min(0)
  calories: number;

  @IsNumber()
  @Min(0)
  protein: number;

  @IsNumber()
  @Min(0)
  carbs: number;

  @IsNumber()
  @Min(0)
  fat: number;

  @IsString()
  @IsOptional()
  barcode?: string;
}

export class MealDto {
  @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
  type: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FoodDto)
  foods: FoodDto[];
}

export class CreateNutritionDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MealDto)
  @IsOptional()
  meals?: MealDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  calorieGoal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  proteinGoal?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  waterMl?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  waterGoal?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}