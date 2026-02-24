import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Nutrition, NutritionDocument } from './schemas/nutrition.schema';
import { CreateNutritionDto } from './dto/create-nutrition.dto';

@Injectable()
export class NutritionService {
  constructor(
    @InjectModel(Nutrition.name)
    private nutritionModel: Model<NutritionDocument>,
  ) {}

  async createOrUpdate(
    clientId: string,
    dto: CreateNutritionDto,
  ): Promise<NutritionDocument> {
    const dateStart = new Date(dto.date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(dto.date);
    dateEnd.setHours(23, 59, 59, 999);

    // compute totals from meals
    const totals = this.computeTotals(dto.meals || []);

    const existing = await this.nutritionModel.findOne({
      clientId: new Types.ObjectId(clientId),
      date: { $gte: dateStart, $lte: dateEnd },
    });

    if (existing) {
      Object.assign(existing, {
        ...dto,
        ...totals,
        date: new Date(dto.date),
        meals: this.computeMealTotals(dto.meals || []),
      });
      return existing.save();
    }

    const nutrition = new this.nutritionModel({
      clientId: new Types.ObjectId(clientId),
      ...dto,
      ...totals,
      date: new Date(dto.date),
      meals: this.computeMealTotals(dto.meals || []),
    });

    return nutrition.save();
  }

  async getClientNutrition(
    clientId: string,
    date: string,
  ): Promise<NutritionDocument> {
    const dateStart = new Date(date);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(date);
    dateEnd.setHours(23, 59, 59, 999);

    const nutrition = await this.nutritionModel.findOne({
      clientId: new Types.ObjectId(clientId),
      date: { $gte: dateStart, $lte: dateEnd },
    });

    if (!nutrition) throw new NotFoundException('No nutrition log for this date');
    return nutrition;
  }

  // get today's nutrition for the logged in client
  async getToday(clientId: string): Promise<NutritionDocument | null> {
    const today = new Date();
    const dateStart = new Date(today);
    dateStart.setHours(0, 0, 0, 0);
    const dateEnd = new Date(today);
    dateEnd.setHours(23, 59, 59, 999);

    return this.nutritionModel.findOne({
      clientId: new Types.ObjectId(clientId),
      date: { $gte: dateStart, $lte: dateEnd },
    });
  }

  // get all nutrition logs for a client
  async getAll(clientId: string): Promise<NutritionDocument[]> {
    return this.nutritionModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: -1 })
      .exec();
  }

  // weekly summary for dashboard
  async getWeeklySummary(clientId: string) {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const logs = await this.nutritionModel
      .find({
        clientId: new Types.ObjectId(clientId),
        date: { $gte: weekAgo },
      })
      .sort({ date: 1 })
      .exec();

    if (logs.length === 0) {
      return {
        avgCalories: 0,
        avgProtein: 0,
        avgCarbs: 0,
        avgFat: 0,
        daysLogged: 0,
        logs: [],
      };
    }

    const avg = (key: string) =>
      Math.round(logs.reduce((s, l) => s + l[key], 0) / logs.length);

    return {
      avgCalories: avg('totalCalories'),
      avgProtein: avg('totalProtein'),
      avgCarbs: avg('totalCarbs'),
      avgFat: avg('totalFat'),
      daysLogged: logs.length,
      logs: logs.map((l) => ({
        date: l.date,
        totalCalories: l.totalCalories,
        totalProtein: l.totalProtein,
        totalCarbs: l.totalCarbs,
        totalFat: l.totalFat,
        calorieGoal: l.calorieGoal,
      })),
    };
  }

  // macros chart data
  async getMacrosChart(clientId: string) {
    const logs = await this.nutritionModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .sort({ date: 1 })
      .select('date totalCalories totalProtein totalCarbs totalFat calorieGoal')
      .exec();

    return logs.map((l) => ({
      date: l.date,
      calories: l.totalCalories,
      protein: l.totalProtein,
      carbs: l.totalCarbs,
      fat: l.totalFat,
      goal: l.calorieGoal,
    }));
  }

  // delete a log
  async deleteLog(logId: string, clientId: string): Promise<void> {
    await this.nutritionModel.findOneAndDelete({
      _id: logId,
      clientId: new Types.ObjectId(clientId),
    });
  }

  // ── helpers ──────────────────────────────────────────────────

  private computeMealTotals(meals: any[]) {
    return meals.map((meal) => {
      const totals = meal.foods.reduce(
        (acc, food) => ({
          totalCalories: acc.totalCalories + (food.calories || 0),
          totalProtein: acc.totalProtein + (food.protein || 0),
          totalCarbs: acc.totalCarbs + (food.carbs || 0),
          totalFat: acc.totalFat + (food.fat || 0),
        }),
        { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
      );
      return { ...meal, ...totals };
    });
  }

  private computeTotals(meals: any[]) {
    return meals.reduce(
      (acc, meal) => {
        const mealTotal = meal.foods.reduce(
          (a, f) => ({
            totalCalories: a.totalCalories + (f.calories || 0),
            totalProtein: a.totalProtein + (f.protein || 0),
            totalCarbs: a.totalCarbs + (f.carbs || 0),
            totalFat: a.totalFat + (f.fat || 0),
          }),
          { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
        );
        return {
          totalCalories: acc.totalCalories + mealTotal.totalCalories,
          totalProtein: acc.totalProtein + mealTotal.totalProtein,
          totalCarbs: acc.totalCarbs + mealTotal.totalCarbs,
          totalFat: acc.totalFat + mealTotal.totalFat,
        };
      },
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
    );
  }
}