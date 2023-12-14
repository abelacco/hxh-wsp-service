import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { NotificationModule } from 'src/notification/notification.module';
import { ChatgtpModule } from 'src/chatgtp/chatgtp.module';
import { CohereModule } from 'src/cohere/cohere.module';
import { ClientHandlerService } from './client-handler/client-handler.service';
import { MongoDbService } from './db/mongodb.service';
import { ClientsService } from 'src/general-services/clients.service';
import { AppointmentService } from 'src/general-services/appointment.service';
import { CommonsService } from 'src/general-services/commons.service';
import { ProviderService } from 'src/general-services/provider.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, BotResponseService, ClientHandlerService, MongoDbService ,ClientsService , AppointmentService , CommonsService , ProviderService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    NotificationModule,
    ChatgtpModule,
    CohereModule
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
