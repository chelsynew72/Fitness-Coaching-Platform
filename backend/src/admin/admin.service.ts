import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { Coach, CoachDocument } from '../coaches/schemas/coach.schema';
import { Subscription, SubscriptionDocument } from '../subscriptions/schemas/subscription.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Coach.name) private coachModel: Model<CoachDocument>,
    @InjectModel(Subscription.name) private subscriptionModel: Model<SubscriptionDocument>,
  ) {}

  async getStats() {
    const [
      totalUsers,
      totalCoaches,
      totalClients,
      pendingCoaches,
      totalSubscriptions,
      activeSubscriptions,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ role: UserRole.COACH }),
      this.userModel.countDocuments({ role: UserRole.CLIENT }),
      this.userModel.countDocuments({ role: UserRole.COACH, isApproved: false, isActive: true }),
      this.subscriptionModel.countDocuments(),
      this.subscriptionModel.countDocuments({ status: 'active' }),
    ]);

    const revenueResult = await this.subscriptionModel.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$paymentHistory.amount' } } },
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;

    const mrr = await this.subscriptionModel.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, mrr: { $sum: '$amount' } } },
    ]);

    return {
      totalUsers,
      totalCoaches,
      totalClients,
      pendingCoaches,
      totalSubscriptions,
      activeSubscriptions,
      totalRevenue,
      mrr: mrr[0]?.mrr || 0,
    };
  }

  async getAllUsers(role?: string, search?: string) {
    const query: any = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }
    return this.userModel
      .find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getPendingCoaches() {
    const pendingUsers = await this.userModel.find({
      role: UserRole.COACH,
      isApproved: false,
      isActive: true,
    }).select('-password -refreshToken');

    const profiles = await Promise.all(
      pendingUsers.map(async (user) => {
        const profile = await this.coachModel.findOne({ userId: user._id });
        return { user, profile };
      })
    );
    return profiles;
  }

  async approveCoach(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isApproved: true });
    return { message: 'Coach approved successfully' };
  }

  async rejectCoach(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, { isActive: false });
    return { message: 'Coach rejected' };
  }

  async setUserActive(userId: string, isActive: boolean) {
    await this.userModel.findByIdAndUpdate(userId, { isActive });
    return { message: `User ${isActive ? 'activated' : 'deactivated'}` };
  }

  async deleteUser(userId: string) {
    await this.userModel.findByIdAndDelete(userId);
    return { message: 'User deleted' };
  }

  async getAllSubscriptions() {
    return this.subscriptionModel
      .find()
      .populate('clientId', 'name email')
      .populate('coachId', 'name email')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getRevenueStats() {
    const monthly = await this.subscriptionModel.aggregate([
      { $unwind: '$paymentHistory' },
      { $match: { 'paymentHistory.status': 'paid' } },
      {
        $group: {
          _id: {
            year: { $year: '$paymentHistory.date' },
            month: { $month: '$paymentHistory.date' },
          },
          revenue: { $sum: '$paymentHistory.amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return { monthly };
  }
}
