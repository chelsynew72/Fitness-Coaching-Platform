import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CoachesService } from './coaches.service';
import { CoachesController } from './coaches.controller';
import { Coach, CoachSchema } from './schemas/coach.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coach.name, schema: CoachSchema }]),
  ],
  providers: [CoachesService],
  controllers: [CoachesController],
  exports: [CoachesService],
})
export class CoachesModule {}