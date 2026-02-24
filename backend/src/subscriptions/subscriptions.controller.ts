import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SubscriptionsController {
  constructor(private subscriptionsService: SubscriptionsService) {}

  // ─── Client routes ─────────────────────────────────────────

  @Post()
  @Roles(userSchema.UserRole.CLIENT)
  subscribe(
    @CurrentUser() user: userSchema.UserDocument,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.subscribe(user.id, dto);
  }

  @Get('my-subscription')
  @Roles(userSchema.UserRole.CLIENT)
  getMySubscription(@CurrentUser() user: userSchema.UserDocument) {
    return this.subscriptionsService.getMySubscription(user.id);
  }

  @Get('my-history')
  @Roles(userSchema.UserRole.CLIENT)
  getMyHistory(@CurrentUser() user: userSchema.UserDocument) {
    return this.subscriptionsService.getMySubscriptionHistory(user.id);
  }

  @Patch('cancel/:coachId')
  @Roles(userSchema.UserRole.CLIENT)
  cancel(
    @CurrentUser() user: userSchema.UserDocument,
    @Param('coachId') coachId: string,
  ) {
    return this.subscriptionsService.cancel(user.id, coachId);
  }

  // ─── Coach routes ─────────────────────────────────────────

  @Get('my-clients')
  @Roles(userSchema.UserRole.COACH)
  getCoachSubscriptions(@CurrentUser() user: userSchema.UserDocument) {
    return this.subscriptionsService.getCoachSubscriptions(user.id);
  }

  @Get('revenue')
  @Roles(userSchema.UserRole.COACH)
  getRevenue(@CurrentUser() user: userSchema.UserDocument) {
    return this.subscriptionsService.getCoachRevenue(user.id);
  }
}