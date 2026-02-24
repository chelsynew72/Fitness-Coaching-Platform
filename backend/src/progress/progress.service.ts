import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Progress, ProgressDocument } from './schemas/progress.schema';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(Progress.name)
    private progressModel: Model<ProgressDocument>,
  ) {}

  // client logs daily progress
  async logProgress(
    clientId: string,
    dto: CreateProgressDto,
  ): Promise<ProgressDocument> {
    // check if already logged for this date
    const dateStart = new Date(dto.date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dto.date);
    dateEnd.setHours(23, 59, 59, 999);

    const existing = await this.progressModel.findOne({
      clientId: new Types.ObjectId(clientId),
      date: { $gte: dateStart, $lte: dateEnd },
    });

    if (existing) {
      Object.assign(existing, {
        ...dto,
        date: new Date(dto.date),
      });
      return existing.save();
    }

    const progress = new this.progressModel({
      clientId: new Types.ObjectId(clientId),
      ...dto,
      date: new Date(dto.date),
    });

    return progress.save();
  }

  // get all progress logs for a client
  async getMyProgress(clientId: string): Promise<ProgressDocument[]> {
    return this.progressModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: 1 })
      .exec();
  }

  // get one progress log
  async getProgressById(logId: string): Promise<ProgressDocument> {
    const log = await this.progressModel.findById(logId);
    if (!log) throw new NotFoundException('Progress log not found');
    return log;
  }

  // update a progress log
  async updateProgress(
    logId: string,
    dto: UpdateProgressDto,
  ): Promise<ProgressDocument> {
    const log = await this.progressModel.findByIdAndUpdate(
      logId,
      { $set: dto },
      { new: true },
    );
    if (!log) throw new NotFoundException('Progress log not found');
    return log;
  }

  // delete a progress log
  async deleteProgress(logId: string): Promise<void> {
    await this.progressModel.findByIdAndDelete(logId);
  }

  // coach views client progress
  async getClientProgress(clientId: string): Promise<ProgressDocument[]> {
    return this.progressModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: 1 })
      .exec();
  }

  // get weight chart data — weight over time
  async getWeightChartData(clientId: string) {
    const logs = await this.progressModel
      .find(
        { clientId: new Types.ObjectId(clientId), weight: { $gt: 0 } },
        { date: 1, weight: 1, weightUnit: 1 },
      )
      .sort({ date: 1 })
      .exec();

    return logs.map((log) => ({
      date: log.date,
      weight: log.weight,
      weightUnit: log.weightUnit,
    }));
  }

  // get measurements chart data
  async getMeasurementsChartData(clientId: string) {
    const logs = await this.progressModel
      .find(
        { clientId: new Types.ObjectId(clientId) },
        { date: 1, measurements: 1 },
      )
      .sort({ date: 1 })
      .exec();

    return logs.map((log) => ({
      date: log.date,
      measurements: log.measurements,
    }));
  }

  // get mood and energy trends
  async getMoodChartData(clientId: string) {
    const logs = await this.progressModel
      .find(
        { clientId: new Types.ObjectId(clientId) },
        { date: 1, mood: 1, energyLevel: 1 },
      )
      .sort({ date: 1 })
      .exec();

    return logs.map((log) => ({
      date: log.date,
      mood: log.mood,
      energyLevel: log.energyLevel,
    }));
  }

  // get full dashboard stats summary
  async getProgressSummary(clientId: string) {
    const logs = await this.progressModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: 1 })
      .exec();

    if (logs.length === 0) {
      return {
        totalLogs: 0,
        firstLog: null,
        latestLog: null,
        weightChange: 0,
        averageMood: 0,
        averageEnergy: 0,
      };
    }

    const firstLog = logs[0];
    const latestLog = logs[logs.length - 1];

    const weightChange =
      firstLog.weight > 0 && latestLog.weight > 0
        ? Number((latestLog.weight - firstLog.weight).toFixed(1))
        : 0;

    const moodLogs = logs.filter((l) => l.mood);
    const energyLogs = logs.filter((l) => l.energyLevel);

    const averageMood =
      moodLogs.length > 0
        ? Number(
            (
              moodLogs.reduce((sum, l) => sum + l.mood, 0) / moodLogs.length
            ).toFixed(1),
          )
        : 0;

    const averageEnergy =
      energyLogs.length > 0
        ? Number(
            (
              energyLogs.reduce((sum, l) => sum + l.energyLevel, 0) /
              energyLogs.length
            ).toFixed(1),
          )
        : 0;

    return {
      totalLogs: logs.length,
      firstLog,
      latestLog,
      weightChange,
      averageMood,
      averageEnergy,
    };
  }
}