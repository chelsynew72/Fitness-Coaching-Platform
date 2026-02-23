import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Coach, CoachDocument } from './schemas/coach.schema';
import { CreateCoachProfileDto } from './dto/create-coach-profile.dto';
import { UpdateCoachProfileDto } from './dto/update-coach-profile.dto';

@Injectable()
export class CoachesService {
  constructor(
    @InjectModel(Coach.name) private coachModel: Model<CoachDocument>,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateCoachProfileDto,
  ): Promise<CoachDocument> {
    const existing = await this.coachModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      throw new ConflictException('Coach profile already exists');
    }

    const coach = new this.coachModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });

    return coach.save();
  }

  async getProfile(userId: string): Promise<CoachDocument> {
    const coach = await this.coachModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email avatar')
      .populate('clients', 'name email avatar');

    if (!coach) throw new NotFoundException('Coach profile not found');
    return coach;
  }

  async getProfileById(coachId: string): Promise<CoachDocument> {
    const coach = await this.coachModel
      .findById(coachId)
      .populate('userId', 'name email avatar');

    if (!coach) throw new NotFoundException('Coach not found');
    return coach;
  }

  async updateProfile(
    userId: string,
    dto: UpdateCoachProfileDto,
  ): Promise<CoachDocument> {
    const coach = await this.coachModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true },
    );

    if (!coach) throw new NotFoundException('Coach profile not found');
    return coach;
  }

  async getAllCoaches(): Promise<CoachDocument[]> {
    return this.coachModel
      .find({ isAvailable: true })
      .populate('userId', 'name email avatar isApproved')
      .exec();
  }

  async addClient(coachUserId: string, clientUserId: string): Promise<void> {
    await this.coachModel.findOneAndUpdate(
      { userId: new Types.ObjectId(coachUserId) },
      { $addToSet: { clients: new Types.ObjectId(clientUserId) } },
    );
  }

  async getCoachClients(userId: string) {
    const coach = await this.coachModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('clients', 'name email avatar');

    if (!coach) throw new NotFoundException('Coach profile not found');
    return coach.clients;
  }
}