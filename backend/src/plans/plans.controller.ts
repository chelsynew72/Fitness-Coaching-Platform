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
import { PlansService } from './plans.service';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('plans')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlansController {
  constructor(private plansService: PlansService) {}

  // ─── Coach routes ─────────────────────────────────────────

  @Post('templates')
  @Roles(UserRole.COACH)
  createTemplate(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreatePlanDto,
  ) {
    return this.plansService.createTemplate(user.id, dto);
  }

  @Get('templates')
  @Roles(UserRole.COACH)
  getMyTemplates(@CurrentUser() user: UserDocument) {
    return this.plansService.getMyTemplates(user.id);
  }

  @Get('templates/:id')
  @Roles(UserRole.COACH)
  getTemplateById(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.plansService.getTemplateById(id, user.id);
  }

  @Patch('templates/:id')
  @Roles(UserRole.COACH)
  updateTemplate(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.updateTemplate(id, user.id, dto);
  }

  @Delete('templates/:id')
  @Roles(UserRole.COACH)
  deleteTemplate(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.plansService.deleteTemplate(id, user.id);
  }

  @Post('templates/:id/assign')
  @Roles(UserRole.COACH)
  assignToClient(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: AssignPlanDto,
  ) {
    return this.plansService.assignToClient(id, user.id, dto);
  }

  @Get('assigned')
  @Roles(UserRole.COACH)
  getAssignedPlans(@CurrentUser() user: UserDocument) {
    return this.plansService.getAssignedPlans(user.id);
  }

  // ─── Client routes ─────────────────────────────────────────

  @Get('my-plan')
  @Roles(UserRole.CLIENT)
  getMyPlan(@CurrentUser() user: UserDocument) {
    return this.plansService.getClientPlan(user.id);
  }
}