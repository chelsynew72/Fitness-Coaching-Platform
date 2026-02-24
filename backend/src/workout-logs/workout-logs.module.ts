import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutLogsService } from './workout-logs.service';
import { WorkoutLogsController } from './workout-logs.controller';
import { WorkoutLog, WorkoutLogSchema } from './schemas/workout-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutLog.name, schema: WorkoutLogSchema },
    ]),
  ],
  providers: [WorkoutLogsService],
  controllers: [WorkoutLogsController],
  exports: [WorkoutLogsService],
})
export class WorkoutLogsModule {}