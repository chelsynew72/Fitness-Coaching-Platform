import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NutritionDocument = Nutrition & Document;

@Schema({ _id: false })
export class Food {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  brand: string;

  @Prop({ default: '' })
  quantity: string;

  @Prop({ default: 0 })
  calories: number;

  @Prop({ default: 0 })
  protein: number;

  @Prop({ default: 0 })
  carbs: number;

  @Prop({ default: 0 })
  fat: number;

  @Prop({ default: '' })
  barcode: string; // from Open Food Facts
}

@Schema({ _id: false })
export class Meal {
  @Prop({ enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true })
  type: string;

  @Prop({ type: [Food], default: [] })
  foods: Food[];

  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProtein: number;

  @Prop({ default: 0 })
  totalCarbs: number;

  @Prop({ default: 0 })
  totalFat: number;
}

@Schema({ timestamps: true })
export class Nutrition {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ type: [Meal], default: [] })
  meals: Meal[];

  // daily totals — computed and stored for quick access
  @Prop({ default: 0 })
  totalCalories: number;

  @Prop({ default: 0 })
  totalProtein: number;

  @Prop({ default: 0 })
  totalCarbs: number;

  @Prop({ default: 0 })
  totalFat: number;

  // goals
  @Prop({ default: 2000 })
  calorieGoal: number;

  @Prop({ default: 150 })
  proteinGoal: number;

  // water tracking
  @Prop({ default: 0 })
  waterMl: number;

  @Prop({ default: 2500 })
  waterGoal: number;

  @Prop({ default: '' })
  notes: string;
}

export const NutritionSchema = SchemaFactory.createForClass(Nutrition);