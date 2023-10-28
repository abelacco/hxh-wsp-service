import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { NotificationModule } from 'src/notification/notification.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  controllers: [MessageController],
  providers: [MessageService, BotResponseService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    NotificationModule,
    DoctorModule
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
