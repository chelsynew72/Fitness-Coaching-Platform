import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CoachDocument = Coach & Document;

@Schema({ timestamps: true })
export class Coach {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ default: '' })
  bio: string;

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop({ default: 0 })
  experience: number;

  @Prop({ default: 0 })
  monthlyRate: number;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  clients: Types.ObjectId[];

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  totalReviews: number;

  @Prop({ default: true })
  isAvailable: boolean;
}

export const CoachSchema = SchemaFactory.createForClass(Coach);