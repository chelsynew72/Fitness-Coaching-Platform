import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Client, ClientDocument } from './schemas/client.schema';
import { CreateClientProfileDto } from './dto/create-client-profile.dto';
import { UpdateClientProfileDto } from './dto/update-client-profile.dto';

@Injectable()
export class ClientsService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<ClientDocument>,
  ) {}

  async createProfile(
    userId: string,
    dto: CreateClientProfileDto,
  ): Promise<ClientDocument> {
    const existing = await this.clientModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (existing) {
      throw new ConflictException('Client profile already exists');
    }

    const client = new this.clientModel({
      userId: new Types.ObjectId(userId),
      ...dto,
    });

    return client.save();
  }

  async getProfile(userId: string): Promise<ClientDocument> {
    const client = await this.clientModel
      .findOne({ userId: new Types.ObjectId(userId) })
      .populate('userId', 'name email avatar')
      .populate('coachId');

    if (!client) throw new NotFoundException('Client profile not found');
    return client;
  }

  async updateProfile(
    userId: string,
    dto: UpdateClientProfileDto,
  ): Promise<ClientDocument> {
    const client = await this.clientModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: dto },
      { new: true },
    );

    if (!client) throw new NotFoundException('Client profile not found');
    return client;
  }

  async assignCoach(userId: string, coachId: string): Promise<ClientDocument> {
    const client = await this.clientModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { coachId: new Types.ObjectId(coachId) },
      { new: true },
    );

    if (!client) throw new NotFoundException('Client profile not found');
    return client;
  }

  async getClientByUserId(userId: string): Promise<ClientDocument> {
    const client = await this.clientModel.findOne({
      userId: new Types.ObjectId(userId),
    });
    if (!client) throw new NotFoundException('Client not found');
    return client;
  }
}