import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateClientProfileDto {
  @IsArray()
  @IsOptional()
  goals?: string[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  currentWeight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  targetWeight?: number;

  @IsString()
  @IsOptional()
  weightUnit?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  age?: number;
}