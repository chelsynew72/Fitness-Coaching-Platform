import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SubscriptionDocument = Subscription & Document;

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  INACTIVE = 'inactive',
}

@Schema({ _id: false })
export class PaymentRecord {
  @Prop({ required: true })
  date: Date;

  @Prop({ required: true })
  amount: number;

  @Prop({ enum: ['paid', 'failed'], default: 'paid' })
  status: string;

  @Prop({ required: true })
  invoiceId: string;
}

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  clientId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  coachId: Types.ObjectId;

  @Prop({ enum: SubscriptionStatus, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Prop({ default: 'monthly' })
  plan: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ default: 'USD' })
  currency: string;

  @Prop({ required: true })
  currentPeriodStart: Date;

  @Prop({ required: true })
  currentPeriodEnd: Date;

  @Prop({ default: false })
  cancelAtPeriodEnd: boolean;

  @Prop({ type: [PaymentRecord], default: [] })
  paymentHistory: PaymentRecord[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);