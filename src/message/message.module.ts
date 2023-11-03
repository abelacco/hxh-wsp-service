import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { NotificationModule } from 'src/notification/notification.module';
import { DoctorModule } from 'src/doctor/doctor.module';
import { ChatgtpModule } from 'src/chatgtp/chatgtp.module';
import { CohereModule } from 'src/cohere/cohere.module';

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
    DoctorModule,
    ChatgtpModule,
    CohereModule
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
