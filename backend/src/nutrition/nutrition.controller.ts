import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NutritionService } from './nutrition.service';
import { OpenFoodFactsService } from './openfoodfacts.service';
import { CreateNutritionDto } from './dto/create-nutrition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';

@Controller('nutrition')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NutritionController {
  constructor(
    private readonly nutritionService: NutritionService,
    private readonly foodSearchService: OpenFoodFactsService,
  ) {}

  // ── Food Search (Open Food Facts) ──────────────────────────

  @Get('search/food')
  searchFood(@Query('q') query: string) {
    return this.foodSearchService.searchFood(query);
  }

  @Get('search/barcode/:barcode')
  getFoodByBarcode(@Param('barcode') barcode: string) {
    return this.foodSearchService.getFoodByBarcode(barcode);
  }

  // ── Client routes ──────────────────────────────────────────

  @Post()
  @Roles(userSchema.UserRole.CLIENT)
  logNutrition(
    @CurrentUser() user: userSchema.UserDocument,
    @Body() dto: CreateNutritionDto,
  ) {
    return this.nutritionService.createOrUpdate(user.id, dto);
  }

  @Get()
  @Roles(userSchema.UserRole.CLIENT)
  getAll(@CurrentUser() user: userSchema.UserDocument) {
    return this.nutritionService.getAll(user.id);
  }

  @Get('today')
  @Roles(userSchema.UserRole.CLIENT)
  getToday(@CurrentUser() user: userSchema.UserDocument) {
    return this.nutritionService.getToday(user.id);
  }

  @Get('summary/weekly')
  @Roles(userSchema.UserRole.CLIENT)
  getWeeklySummary(@CurrentUser() user: userSchema.UserDocument) {
    return this.nutritionService.getWeeklySummary(user.id);
  }

  @Get('charts/macros')
  @Roles(userSchema.UserRole.CLIENT)
  getMacrosChart(@CurrentUser() user: userSchema.UserDocument) {
    return this.nutritionService.getMacrosChart(user.id);
  }

  @Get('date')
  @Roles(userSchema.UserRole.CLIENT)
  getByDate(
    @CurrentUser() user: userSchema.UserDocument,
    @Query('date') date: string,
  ) {
    return this.nutritionService.getClientNutrition(user.id, date);
  }

  @Delete(':id')
  @Roles(userSchema.UserRole.CLIENT)
  deleteLog(
    @CurrentUser() user: userSchema.UserDocument,
    @Param('id') id: string,
  ) {
    return this.nutritionService.deleteLog(id, user.id);
  }

  // ── Coach routes ───────────────────────────────────────────

  @Post('client/:clientId')
  @Roles(userSchema.UserRole.COACH)
  createForClient(
    @Param('clientId') clientId: string,
    @Body() dto: CreateNutritionDto,
  ) {
    return this.nutritionService.createOrUpdate(clientId, dto);
  }

  @Get('client/:clientId')
  @Roles(userSchema.UserRole.COACH)
  getClientNutrition(
    @Param('clientId') clientId: string,
    @Query('date') date: string,
  ) {
    return this.nutritionService.getClientNutrition(clientId, date);
  }

  @Get('client/:clientId/summary')
  @Roles(userSchema.UserRole.COACH)
  getClientSummary(@Param('clientId') clientId: string) {
    return this.nutritionService.getWeeklySummary(clientId);
  }
}