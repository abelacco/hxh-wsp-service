import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { DoctorService } from 'src/doctor/doctor.service';
import { NotificationsService } from 'src/notifications/notifications.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, BotResponseService, DoctorService, NotificationsService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
