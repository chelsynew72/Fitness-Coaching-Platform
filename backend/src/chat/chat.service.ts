import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  // generate consistent conversation ID from two user IDs
  getConversationId(userId1: string, userId2: string): string {
    return [userId1, userId2].sort().join('_');
  }

  // save message to database
  async saveMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: string = 'text',
  ): Promise<MessageDocument> {
    const conversationId = this.getConversationId(senderId, receiverId);

    const message = new this.messageModel({
      conversationId,
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(receiverId),
      content,
      type,
    });

    return message.save();
  }

  // get all messages in a conversation
  async getConversation(
    userId1: string,
    userId2: string,
  ): Promise<MessageDocument[]> {
    const conversationId = this.getConversationId(userId1, userId2);

    return this.messageModel
      .find({ conversationId })
      .populate('senderId', 'name avatar')
      .populate('receiverId', 'name avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  // mark all messages in a conversation as read
  async markAsRead(conversationId: string, userId: string): Promise<void> {
    await this.messageModel.updateMany(
      {
        conversationId,
        receiverId: new Types.ObjectId(userId),
        read: false,
      },
      { read: true },
    );
  }

  // get unread message count for a user
  async getUnreadCount(userId: string): Promise<number> {
    return this.messageModel.countDocuments({
      receiverId: new Types.ObjectId(userId),
      read: false,
    });
  }

  // get all conversations for a user with latest message
  async getConversations(userId: string) {
    const messages = await this.messageModel
      .find({
        $or: [
          { senderId: new Types.ObjectId(userId) },
          { receiverId: new Types.ObjectId(userId) },
        ],
      })
      .populate('senderId', 'name avatar role')
      .populate('receiverId', 'name avatar role')
      .sort({ createdAt: -1 })
      .exec();

    // group by conversationId and return latest message per conversation
    const conversationMap = new Map();
    messages.forEach((msg) => {
      if (!conversationMap.has(msg.conversationId)) {
        conversationMap.set(msg.conversationId, msg);
      }
    });

    return Array.from(conversationMap.values());
  }
}