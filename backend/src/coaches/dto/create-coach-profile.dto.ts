import {
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateCoachProfileDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsArray()
  @IsOptional()
  specialties?: string[];

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  experience?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  monthlyRate?: number;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}