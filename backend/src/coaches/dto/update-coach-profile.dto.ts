import { PartialType } from '@nestjs/mapped-types';
import { CreateCoachProfileDto } from './create-coach-profile.dto';

export class UpdateCoachProfileDto extends PartialType(CreateCoachProfileDto) {}