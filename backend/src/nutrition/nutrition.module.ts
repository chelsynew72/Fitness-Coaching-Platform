import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionService } from './nutrition.service';
import { NutritionController } from './nutrition.controller';
import { OpenFoodFactsService } from './openfoodfacts.service';
import { Nutrition, NutritionSchema } from './schemas/nutrition.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Nutrition.name, schema: NutritionSchema },
    ]),
  ],
  providers: [NutritionService, OpenFoodFactsService],
  controllers: [NutritionController],
  exports: [NutritionService],
})
export class NutritionModule {}