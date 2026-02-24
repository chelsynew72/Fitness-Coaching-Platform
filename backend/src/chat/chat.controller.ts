import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import * as userSchema from '../users/schemas/user.schema';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  // get all conversations for current user
  @Get('conversations')
  getConversations(@CurrentUser() user: userSchema.UserDocument) {
    return this.chatService.getConversations(user.id);
  }

  // get message history between two users
  @Get(':userId')
  getConversation(
    @CurrentUser() user: userSchema.UserDocument,
    @Param('userId') otherUserId: string,
  ) {
    return this.chatService.getConversation(user.id, otherUserId);
  }

  // get unread message count
  @Get('unread/count')
  getUnreadCount(@CurrentUser() user: userSchema.UserDocument) {
    return this.chatService.getUnreadCount(user.id);
  }
}