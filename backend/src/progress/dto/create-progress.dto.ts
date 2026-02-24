import {
  IsNumber,
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementsDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  chest?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  waist?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  hips?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  arms?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  thighs?: number;
}

export class CreateProgressDto {
  @IsDateString()
  date: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  bodyFatPercentage?: number;

  @ValidateNested()
  @Type(() => MeasurementsDto)
  @IsOptional()
  measurements?: MeasurementsDto;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  mood?: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  energyLevel?: number;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsArray()
  @IsOptional()
  photos?: string[];
}