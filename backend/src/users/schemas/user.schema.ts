import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  COACH = 'coach',
  CLIENT = 'client',
  ADMIN = 'admin',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ enum: UserRole, required: true })
  role: UserRole;

  @Prop({ default: '' })
  avatar: string;

  @Prop({ default: false })
  isApproved: boolean; // coaches need admin approval

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  refreshToken: string; // hashed refresh token stored here
}

export const UserSchema = SchemaFactory.createForClass(User);