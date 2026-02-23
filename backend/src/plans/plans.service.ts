import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Plan, PlanDocument } from './schemas/plan.schema';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { AssignPlanDto } from './dto/assign-plan.dto';

@Injectable()
export class PlansService {
  constructor(
    @InjectModel(Plan.name) private planModel: Model<PlanDocument>,
  ) {}

  // coach creates a new template
  async createTemplate(
    coachId: string,
    dto: CreatePlanDto,
  ): Promise<PlanDocument> {
    const plan = new this.planModel({
      coachId: new Types.ObjectId(coachId),
      ...dto,
      isTemplate: true,
      assignedTo: null,
    });
    return plan.save();
  }

  // get all templates created by this coach
  async getMyTemplates(coachId: string): Promise<PlanDocument[]> {
    return this.planModel
      .find({
        coachId: new Types.ObjectId(coachId),
        isTemplate: true,
      })
      .exec();
  }

  // get one template by id
  async getTemplateById(
    planId: string,
    coachId: string,
  ): Promise<PlanDocument> {
    const plan = await this.planModel.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.coachId.toString() !== coachId) {
      throw new ForbiddenException('You do not own this plan');
    }
    return plan;
  }

  // update a template
  async updateTemplate(
    planId: string,
    coachId: string,
    dto: UpdatePlanDto,
  ): Promise<PlanDocument> {
    const plan = await this.planModel.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.coachId.toString() !== coachId) {
      throw new ForbiddenException('You do not own this plan');
    }

    Object.assign(plan, dto);
    return plan.save();
  }

  // delete a template
  async deleteTemplate(planId: string, coachId: string): Promise<void> {
    const plan = await this.planModel.findById(planId);
    if (!plan) throw new NotFoundException('Plan not found');
    if (plan.coachId.toString() !== coachId) {
      throw new ForbiddenException('You do not own this plan');
    }
    await this.planModel.findByIdAndDelete(planId);
  }

  // clone a template and assign to a client — the key feature
  async assignToClient(
    planId: string,
    coachId: string,
    dto: AssignPlanDto,
  ): Promise<PlanDocument> {
    const template = await this.planModel.findById(planId);
    if (!template) throw new NotFoundException('Plan not found');
    if (template.coachId.toString() !== coachId) {
      throw new ForbiddenException('You do not own this plan');
    }

    // deep clone the template — convert to plain object, strip _id
    const templateObj = template.toObject() as any;
    delete templateObj._id;
    delete templateObj.createdAt;
    delete templateObj.updatedAt;
    delete templateObj.__v;

    // create the cloned plan assigned to the client
    const assignedPlan = new this.planModel({
      ...templateObj,
      isTemplate: false,
      assignedTo: new Types.ObjectId(dto.clientId),
    });

    return assignedPlan.save();
  }

  // get the plan assigned to a specific client
  async getClientPlan(clientId: string): Promise<PlanDocument> {
    const plan = await this.planModel.findOne({
      assignedTo: new Types.ObjectId(clientId),
      isTemplate: false,
    });
    if (!plan) throw new NotFoundException('No plan assigned to this client');
    return plan;
  }

  // coach gets all assigned plans for their clients
  async getAssignedPlans(coachId: string): Promise<PlanDocument[]> {
    return this.planModel
      .find({
        coachId: new Types.ObjectId(coachId),
        isTemplate: false,
      })
      .populate('assignedTo', 'name email avatar')
      .exec();
  }
}