import {
  Controller, Get, Patch, Delete,
  Param, UseGuards, Query
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(private adminService: AdminService) {}

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  getAllUsers(@Query('role') role?: string, @Query('search') search?: string) {
    return this.adminService.getAllUsers(role, search);
  }

  @Get('coaches/pending')
  getPendingCoaches() {
    return this.adminService.getPendingCoaches();
  }

  @Patch('coaches/:id/approve')
  approveCoach(@Param('id') id: string) {
    return this.adminService.approveCoach(id);
  }

  @Patch('coaches/:id/reject')
  rejectCoach(@Param('id') id: string) {
    return this.adminService.rejectCoach(id);
  }

  @Patch('users/:id/activate')
  activateUser(@Param('id') id: string) {
    return this.adminService.setUserActive(id, true);
  }

  @Patch('users/:id/deactivate')
  deactivateUser(@Param('id') id: string) {
    return this.adminService.setUserActive(id, false);
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('subscriptions')
  getAllSubscriptions() {
    return this.adminService.getAllSubscriptions();
  }

  @Get('revenue')
  getRevenueStats() {
    return this.adminService.getRevenueStats();
  }
}
