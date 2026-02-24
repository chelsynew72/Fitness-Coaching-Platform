import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { WorkoutLogsService } from './workout-logs.service';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';

@Controller('workout-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkoutLogsController {
  constructor(private workoutLogsService: WorkoutLogsService) {}

  // ─── Client routes ─────────────────────────────────────────

  @Post()
  @Roles(userSchema.UserRole.CLIENT)
  logWorkout(
    @CurrentUser() user: userSchema.UserDocument,
    @Body() dto: CreateWorkoutLogDto,
  ) {
    return this.workoutLogsService.logWorkout(user.id, dto);
  }

  @Get()
  @Roles(userSchema.UserRole.CLIENT)
  getMyLogs(@CurrentUser() user: userSchema.UserDocument) {
    return this.workoutLogsService.getMyLogs(user.id);
  }

  @Get('weekly')
  @Roles(userSchema.UserRole.CLIENT)
  getWeeklyLogs(@CurrentUser() user: userSchema.UserDocument) {
    return this.workoutLogsService.getWeeklyLogs(user.id);
  }

  @Get('stats')
  @Roles(userSchema.UserRole.CLIENT)
  getStats(@CurrentUser() user: userSchema.UserDocument) {
    return this.workoutLogsService.getStats(user.id);
  }

  @Get('streak')
  @Roles(userSchema.UserRole.CLIENT)
  getStreak(@CurrentUser() user: userSchema.UserDocument) {
    return this.workoutLogsService.getStreak(user.id);
  }

  @Get(':id')
  @Roles(userSchema.UserRole.CLIENT)
  getLogById(@Param('id') id: string) {
    return this.workoutLogsService.getLogById(id);
  }

  // ─── Coach routes ─────────────────────────────────────────

  @Get('client/:clientId')
  @Roles(userSchema.UserRole.COACH)
  getClientLogs(@Param('clientId') clientId: string) {
    return this.workoutLogsService.getClientLogs(clientId);
  }
}