import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WorkoutLogDocument = WorkoutLog & Document;

@Schema({ _id: false })
export class CompletedSet {
  @Prop({ required: true })
  setNumber: number;

  @Prop({ default: 0 })
  repsCompleted: number;

  @Prop({ default: 0 })
  weightUsed: number;

  @Prop({ default: false })
  completed: boolean;
}

@Schema({ _id: false })
export class CompletedExercise {
  @Prop({ required: true })
  name: string;

  @Prop({ type: [CompletedSet], default: [] })
  setsCompleted: CompletedSet[];
}

@Schema({ timestamps: true })
export class WorkoutLog {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Plan', required: true })
  planId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  weekNumber: number;

  @Prop({ required: true })
  dayNumber: number;

  @Prop({ default: false })
  completed: boolean;

  @Prop({ default: 0 })
  durationMinutes: number;

  @Prop({ type: [CompletedExercise], default: [] })
  exercises: CompletedExercise[];

  @Prop({ default: '' })
  notes: string;

  @Prop({ min: 1, max: 5, default: null })
  rating: number; // how hard was the session 1-5
}

export const WorkoutLogSchema = SchemaFactory.createForClass(WorkoutLog);