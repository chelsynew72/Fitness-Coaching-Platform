import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { WorkoutLog, WorkoutLogDocument } from './schemas/workout-log.schema';
import { CreateWorkoutLogDto } from './dto/create-workout-log.dto';

@Injectable()
export class WorkoutLogsService {
  constructor(
    @InjectModel(WorkoutLog.name)
    private workoutLogModel: Model<WorkoutLogDocument>,
  ) {}

  // client logs a workout session
  async logWorkout(
    clientId: string,
    dto: CreateWorkoutLogDto,
  ): Promise<WorkoutLogDocument> {
    // check if already logged for this day
    const existing = await this.workoutLogModel.findOne({
      clientId: new Types.ObjectId(clientId),
      planId: new Types.ObjectId(dto.planId),
      weekNumber: dto.weekNumber,
      dayNumber: dto.dayNumber,
    });

    if (existing) {
      // update existing log instead of creating duplicate
      Object.assign(existing, {
        ...dto,
        date: new Date(dto.date),
      });
      return existing.save();
    }

    const log = new this.workoutLogModel({
      clientId: new Types.ObjectId(clientId),
      ...dto,
      planId: new Types.ObjectId(dto.planId),
      date: new Date(dto.date),
    });

    return log.save();
  }

  // get all workout logs for a client
  async getMyLogs(clientId: string): Promise<WorkoutLogDocument[]> {
    return this.workoutLogModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .exec();
  }

  // get a specific log
  async getLogById(logId: string): Promise<WorkoutLogDocument> {
    const log = await this.workoutLogModel.findById(logId);
    if (!log) throw new NotFoundException('Workout log not found');
    return log;
  }

  // coach views a client's logs
  async getClientLogs(clientId: string): Promise<WorkoutLogDocument[]> {
    return this.workoutLogModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .exec();
  }

  // get logs for current week
  async getWeeklyLogs(clientId: string): Promise<WorkoutLogDocument[]> {
    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return this.workoutLogModel
      .find({
        clientId: new Types.ObjectId(clientId),
        date: { $gte: startOfWeek, $lte: endOfWeek },
      })
      .sort({ date: 1 })
      .exec();
  }

  // calculate current streak — consecutive days with completed workouts
  async getStreak(clientId: string): Promise<number> {
    const logs = await this.workoutLogModel
      .find({
        clientId: new Types.ObjectId(clientId),
        completed: true,
      })
      .sort({ date: -1 })
      .exec();

    if (logs.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < logs.length; i++) {
      const logDate = new Date(logs[i].date);
      logDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (logDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  // get completion stats for a client
  async getStats(clientId: string) {
    const totalLogs = await this.workoutLogModel.countDocuments({
      clientId: new Types.ObjectId(clientId),
    });

    const completedLogs = await this.workoutLogModel.countDocuments({
      clientId: new Types.ObjectId(clientId),
      completed: true,
    });

    const streak = await this.getStreak(clientId);

    const recentLogs = await this.workoutLogModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .limit(7)
      .exec();

    return {
      totalWorkouts: totalLogs,
      completedWorkouts: completedLogs,
      completionRate:
        totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0,
      currentStreak: streak,
      recentLogs,
    };
  }
}