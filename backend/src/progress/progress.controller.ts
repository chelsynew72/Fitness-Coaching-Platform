import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ProgressService } from './progress.service';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';

@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  // ─── Client routes ─────────────────────────────────────────

  @Post()
  @Roles(userSchema.UserRole.CLIENT)
  logProgress(
    @CurrentUser() user: userSchema.UserDocument,
    @Body() dto: CreateProgressDto,
  ) {
    return this.progressService.logProgress(user.id, dto);
  }

  @Get()
  @Roles(userSchema.UserRole.CLIENT)
  getMyProgress(@CurrentUser() user: userSchema.UserDocument) {
    return this.progressService.getMyProgress(user.id);
  }

  @Get('summary')
  @Roles(userSchema.UserRole.CLIENT)
  getProgressSummary(@CurrentUser() user: userSchema.UserDocument) {
    return this.progressService.getProgressSummary(user.id);
  }

  @Get('charts/weight')
  @Roles(userSchema.UserRole.CLIENT)
  getWeightChart(@CurrentUser() user: userSchema.UserDocument) {
    return this.progressService.getWeightChartData(user.id);
  }

  @Get('charts/measurements')
  @Roles(userSchema.UserRole.CLIENT)
  getMeasurementsChart(@CurrentUser() user: userSchema.UserDocument) {
    return this.progressService.getMeasurementsChartData(user.id);
  }

  @Get('charts/mood')
  @Roles(userSchema.UserRole.CLIENT)
  getMoodChart(@CurrentUser() user: userSchema.UserDocument) {
    return this.progressService.getMoodChartData(user.id);
  }

  @Get(':id')
  @Roles(userSchema.UserRole.CLIENT)
  getProgressById(@Param('id') id: string) {
    return this.progressService.getProgressById(id);
  }

  @Patch(':id')
  @Roles(userSchema.UserRole.CLIENT)
  updateProgress(
    @Param('id') id: string,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.progressService.updateProgress(id, dto);
  }

  @Delete(':id')
  @Roles(userSchema.UserRole.CLIENT)
  deleteProgress(@Param('id') id: string) {
    return this.progressService.deleteProgress(id);
  }

  // ─── Coach routes ─────────────────────────────────────────

  @Get('client/:clientId')
  @Roles(userSchema.UserRole.COACH)
  getClientProgress(@Param('clientId') clientId: string) {
    return this.progressService.getClientProgress(clientId);
  }

  @Get('client/:clientId/summary')
  @Roles(userSchema.UserRole.COACH)
  getClientSummary(@Param('clientId') clientId: string) {
    return this.progressService.getProgressSummary(clientId);
  }
}