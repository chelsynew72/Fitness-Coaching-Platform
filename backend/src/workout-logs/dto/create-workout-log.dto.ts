import {
  IsMongoId,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  IsOptional,
  ValidateNested,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CompletedSetDto {
  @IsNumber()
  setNumber: number;

  @IsNumber()
  @Min(0)
  repsCompleted: number;

  @IsNumber()
  @Min(0)
  weightUsed: number;

  @IsBoolean()
  completed: boolean;
}

export class CompletedExerciseDto {
  @IsString()
  name: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletedSetDto)
  setsCompleted: CompletedSetDto[];
}

export class CreateWorkoutLogDto {
  @IsMongoId()
  planId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  weekNumber: number;

  @IsNumber()
  dayNumber: number;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsNumber()
  @Min(0)
  @IsOptional()
  durationMinutes?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompletedExerciseDto)
  @IsOptional()
  exercises?: CompletedExerciseDto[];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  rating?: number;
}