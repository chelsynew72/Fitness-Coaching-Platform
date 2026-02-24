import { IsString, IsMongoId, IsOptional, IsEnum } from 'class-validator';

export class SendMessageDto {
  @IsMongoId()
  receiverId: string;

  @IsString()
  content: string;

  @IsEnum(['text', 'image', 'file'])
  @IsOptional()
  type?: string;
}