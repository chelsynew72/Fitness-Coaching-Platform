import {
  IsString,
  IsEnum,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PlanGoal } from '../schemas/plan.schema';

export class ExerciseDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  muscleGroup?: string;

  @IsNumber()
  @Min(0)
  sets: number;

  @IsNumber()
  @Min(0)
  reps: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  duration?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  restSeconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  videoUrl?: string;
}

export class DayDto {
  @IsNumber()
  @Min(1)
  @Max(7)
  dayNumber: number;

  @IsString()
  name: string;

  @IsBoolean()
  @IsOptional()
  isRestDay?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseDto)
  @IsOptional()
  exercises?: ExerciseDto[];
}

export class WeekDto {
  @IsNumber()
  @Min(1)
  weekNumber: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DayDto)
  days: DayDto[];
}

export class CreatePlanDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(PlanGoal)
  @IsOptional()
  goal?: PlanGoal;

  @IsNumber()
  @Min(1)
  @Max(52)
  @IsOptional()
  durationWeeks?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeekDto)
  @IsOptional()
  weeks?: WeekDto[];
}