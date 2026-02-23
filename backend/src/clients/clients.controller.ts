import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ClientsService } from './clients.service';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserDocument } from '../users/schemas/user.schema';
import { UserRole } from '../users/schemas/user.schema';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get('profile')
  @Roles(UserRole.CLIENT)
  getMyProfile(@CurrentUser() user: UserDocument) {
    return this.clientsService.getProfile(user._id.toString());
  }

  @Post('profile')
  @Roles(UserRole.CLIENT)
  createProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateClientProfileDto,
  ) {
    return this.clientsService.createProfile(user._id.toString(), dto);
  }

  @Patch('profile')
  @Roles(UserRole.CLIENT)
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateClientProfileDto,
  ) {
    return this.clientsService.updateProfile(user._id.toString(), dto);
  }
}