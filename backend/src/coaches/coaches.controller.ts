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
export class CoachesController {
  constructor(private coachesService: CoachesService) {}

  // PUBLIC — no auth required
  @Get()
  getAllCoaches() {
    return this.coachesService.getAllCoaches();
  }

  // PUBLIC — no auth required
  @Get(':id')
  getCoachById(@Param('id') id: string) {
    return this.coachesService.getProfileById(id);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  getMyProfile(@CurrentUser() user: UserDocument) {
    return this.coachesService.getProfile(user._id.toString());
  }

  @Post('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  createProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateCoachProfileDto,
  ) {
    return this.coachesService.createProfile(user._id.toString(), dto);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateCoachProfileDto,
  ) {
    return this.coachesService.updateProfile(user._id.toString(), dto);
  }

  @Get('my-clients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.COACH)
  getMyClients(@CurrentUser() user: UserDocument) {
    return this.coachesService.getCoachClients(user._id.toString());
  }
}
