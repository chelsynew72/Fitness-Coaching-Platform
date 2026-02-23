import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ClientDocument = Client & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  CANCELLED = 'cancelled',
  TRIALING = 'trialing',
}

@Schema({ timestamps: true })
export class Client {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Coach', default: null })
  coachId: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  goals: string[];

  @Prop({ default: 0 })
  currentWeight: number;

  @Prop({ default: 0 })
  targetWeight: number;

  @Prop({ default: 'kg' })
  weightUnit: string;

  @Prop({ default: 0 })
  height: number;

  @Prop({ default: 0 })
  age: number;

  @Prop({
    enum: SubscriptionStatus,
    default: SubscriptionStatus.INACTIVE,
  })
  subscriptionStatus: SubscriptionStatus;

  @Prop({ default: null })
  subscriptionStartDate: Date;

  @Prop({ default: null })
  nextBillingDate: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);