import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PlanDocument = Plan & Document;

export enum PlanGoal {
  WEIGHT_LOSS = 'weight_loss',
  MUSCLE_GAIN = 'muscle_gain',
  ENDURANCE = 'endurance',
  FLEXIBILITY = 'flexibility',
  GENERAL_FITNESS = 'general_fitness',
}

@Schema({ _id: false })
export class ExerciseSet {
  @Prop({ required: true })
  setNumber: number;

  @Prop({ default: 0 })
  reps: number;

  @Prop({ default: 0 })
  weight: number;

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ _id: false })
export class Exercise {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  muscleGroup: string;

  @Prop({ default: 0 })
  sets: number;

  @Prop({ default: 0 })
  reps: number;

  @Prop({ default: 0 })
  weight: number;

  @Prop({ default: 0 })
  duration: number; // seconds, for timed exercises

  @Prop({ default: 60 })
  restSeconds: number;

  @Prop({ default: '' })
  notes: string;

  @Prop({ default: '' })
  videoUrl: string;
}

@Schema({ _id: false })
export class Day {
  @Prop({ required: true })
  dayNumber: number; // 1-7

  @Prop({ required: true })
  name: string; // e.g. "Monday - Push Day"

  @Prop({ default: false })
  isRestDay: boolean;

  @Prop({ type: [Exercise], default: [] })
  exercises: Exercise[];
}

@Schema({ _id: false })
export class Week {
  @Prop({ required: true })
  weekNumber: number;

  @Prop({ type: [Day], default: [] })
  days: Day[];
}

@Schema({ timestamps: true })
export class Plan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  coachId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ enum: PlanGoal, default: PlanGoal.GENERAL_FITNESS })
  goal: PlanGoal;

  @Prop({ default: 4 })
  durationWeeks: number;

  @Prop({ default: true })
  isTemplate: boolean; // true = reusable template, false = assigned to client

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  assignedTo: Types.ObjectId; // null if template, clientId if cloned

  @Prop({ type: [Week], default: [] })
  weeks: Week[];
}

export const PlanSchema = SchemaFactory.createForClass(Plan);