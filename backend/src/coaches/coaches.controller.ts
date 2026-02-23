import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
  Param,
} from '@nestjs/common';
import { CoachesService } from './coaches.service';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { UpdateCoachProfileDto } from './dto/update-coach-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('coaches')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CoachesController {
  constructor(private coachesService: CoachesService) {}

  // public — all logged in users can browse coaches
  @Get()
  getAllCoaches() {
    return this.coachesService.getAllCoaches();
  }

  @Get('profile')
  @Roles(UserRole.COACH)
  getMyProfile(@CurrentUser() user: UserDocument) {
    return this.coachesService.getProfile(user._id.toString());
  }

  @Get(':id')
  getCoachById(@Param('id') id: string) {
    return this.coachesService.getProfileById(id);
  }

  @Post('profile')
  @Roles(UserRole.COACH)
  createProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateCoachProfileDto,
  ) {
    return this.coachesService.createProfile(user._id.toString(), dto);
  }

  @Patch('profile')
  @Roles(UserRole.COACH)
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateCoachProfileDto,
  ) {
    return this.coachesService.updateProfile(user._id.toString(), dto);
  }

  @Get('my-clients')
  @Roles(UserRole.COACH)
  getMyClients(@CurrentUser() user: UserDocument) {
    return this.coachesService.getCoachClients(user._id.toString());
  }
}