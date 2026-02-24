import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProgressDocument = Progress & Document;

@Schema({ _id: false })
export class Measurements {
  @Prop({ default: 0 })
  chest: number;

  @Prop({ default: 0 })
  waist: number;

  @Prop({ default: 0 })
  hips: number;

  @Prop({ default: 0 })
  arms: number;

  @Prop({ default: 0 })
  thighs: number;
}

@Schema({ timestamps: true })
export class Progress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ required: true })
  date: Date;

  @Prop({ default: 0 })
  weight: number;

  @Prop({ default: 'kg' })
  weightUnit: string;

  @Prop({ default: 0 })
  bodyFatPercentage: number;

  @Prop({ type: Measurements, default: {} })
  measurements: Measurements;

  @Prop({ min: 1, max: 5, default: null })
  mood: number;

  @Prop({ min: 1, max: 5, default: null })
  energyLevel: number;

  @Prop({ default: '' })
  notes: string;

  @Prop({ type: [String], default: [] })
  photos: string[]; // Cloudinary URLs
}

export const ProgressSchema = SchemaFactory.createForClass(Progress);