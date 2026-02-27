import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
import {
  Subscription,
  SubscriptionDocument,
  SubscriptionStatus,
} from './schemas/subscription.schema';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { ChatService } from '../chat/chat.service';
import { Coach, CoachDocument } from '../coaches/schemas/coach.schema';

@Injectable()
export class SubscriptionsService {
  constructor(
    private chatService: ChatService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(Coach.name)
    private coachModel: Model<CoachDocument>,
  ) {}

  // client subscribes to a coach
  async subscribe(
    clientId: string,
    dto: CreateSubscriptionDto,
  ): Promise<SubscriptionDocument> {
    // check if already subscribed to this coach
    const existing = await this.subscriptionModel.findOne({
      clientId: new Types.ObjectId(clientId),
      coachId: new Types.ObjectId(dto.coachId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (existing) {
      throw new ConflictException('Already subscribed to this coach');
    }

    // get coach rate
    const coach = await this.coachModel.findOne({
      userId: new Types.ObjectId(dto.coachId),
    });

    if (!coach) throw new NotFoundException('Coach not found');

    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);

    const subscription = new this.subscriptionModel({
      clientId: new Types.ObjectId(clientId),
      coachId: new Types.ObjectId(dto.coachId),
      status: SubscriptionStatus.ACTIVE,
      amount: coach.monthlyRate,
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      paymentHistory: [
        {
          date: now,
          amount: coach.monthlyRate,
          status: 'paid',
          invoiceId: uuidv4(),
        },
      ],
    });

    await subscription.save();

    // auto-send welcome message from client to coach
    try {
      await this.chatService.saveMessage(
        clientId,
        dto.coachId,
        "Hi! I just subscribed to your coaching plan. Looking forward to getting started! 💪"
      );
    } catch (e) {
      console.error('Failed to send auto message:', e);
    }

    // add client to coach's client list
    await this.coachModel.findOneAndUpdate(
      { userId: new Types.ObjectId(dto.coachId) },
      { $addToSet: { clients: new Types.ObjectId(clientId) } },
    );

    return subscription;
  }

  // client cancels subscription
  async cancel(clientId: string, coachId: string): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel.findOne({
      clientId: new Types.ObjectId(clientId),
      coachId: new Types.ObjectId(coachId),
      status: SubscriptionStatus.ACTIVE,
    });

    if (!subscription) throw new NotFoundException('Active subscription not found');

    // dont cancel immediately — access continues until period end
    subscription.cancelAtPeriodEnd = true;
    return subscription.save();
  }

  // get client's active subscription
  async getMySubscription(clientId: string): Promise<SubscriptionDocument> {
    const subscription = await this.subscriptionModel
      .findOne({
        clientId: new Types.ObjectId(clientId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('coachId', 'name email avatar')
      .exec();

    if (!subscription) throw new NotFoundException('No active subscription found');
    return subscription;
  }

  // get client's full subscription history
  async getMySubscriptionHistory(clientId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel
      .find({ clientId: new Types.ObjectId(clientId) })
      .populate('coachId', 'name email avatar')
      .sort({ createdAt: -1 })
      .exec();
  }

  // coach sees all their active subscriptions
  async getCoachSubscriptions(coachId: string): Promise<SubscriptionDocument[]> {
    return this.subscriptionModel
      .find({
        coachId: new Types.ObjectId(coachId),
        status: SubscriptionStatus.ACTIVE,
      })
      .populate('clientId', 'name email avatar')
      .exec();
  }

  // coach revenue dashboard
  async getCoachRevenue(coachId: string) {
    const subscriptions = await this.subscriptionModel
      .find({ coachId: new Types.ObjectId(coachId) })
      .exec();

    const activeSubscriptions = subscriptions.filter(
      (s) => s.status === SubscriptionStatus.ACTIVE,
    );

    const totalRevenue = subscriptions.reduce((sum, sub) => {
      return (
        sum +
        sub.paymentHistory
          .filter((p) => p.status === 'paid')
          .reduce((s, p) => s + p.amount, 0)
      );
    }, 0);

    const mrr = activeSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

    // monthly revenue breakdown for chart
    const monthlyRevenue: Record<string, number> = {};
    subscriptions.forEach((sub) => {
      sub.paymentHistory.forEach((payment) => {
        if (payment.status === 'paid') {
          const month = new Date(payment.date).toISOString().slice(0, 7);
          monthlyRevenue[month] = (monthlyRevenue[month] || 0) + payment.amount;
        }
      });
    });

    return {
      totalRevenue,
      mrr,
      activeSubscriptions: activeSubscriptions.length,
      monthlyRevenue,
    };
  }

  // ─── Cron job — runs every day at midnight ─────────────────
  // this is the billing engine — mirrors how Stripe Billing works
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async processBilling() {
    console.log('Running billing cycle...');

    const now = new Date();

    // find all active subscriptions where period has ended
    const dueSubscriptions = await this.subscriptionModel.find({
      status: SubscriptionStatus.ACTIVE,
      currentPeriodEnd: { $lte: now },
    });

    for (const sub of dueSubscriptions) {
      if (sub.cancelAtPeriodEnd) {
        // subscription was cancelled — deactivate it
        sub.status = SubscriptionStatus.INACTIVE;
        await sub.save();
        console.log(`Subscription ${sub._id} deactivated after period end`);
      } else {
        // renew — extend by 30 days and log payment
        const newPeriodStart = new Date();
        const newPeriodEnd = new Date();
        newPeriodEnd.setDate(newPeriodEnd.getDate() + 30);

        sub.currentPeriodStart = newPeriodStart;
        sub.currentPeriodEnd = newPeriodEnd;
        sub.paymentHistory.push({
          date: now,
          amount: sub.amount,
          status: 'paid',
          invoiceId: uuidv4(),
        });

        await sub.save();
        console.log(`Subscription ${sub._id} renewed for 30 days`);
      }
    }
  }
}