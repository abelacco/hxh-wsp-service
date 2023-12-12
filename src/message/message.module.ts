import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { NotificationModule } from 'src/notification/notification.module';
import { ProviderModule } from 'src/providers/provider.module';
import { ChatgtpModule } from 'src/chatgtp/chatgtp.module';
import { CohereModule } from 'src/cohere/cohere.module';
import { ClientHandlerService } from './client-handler/client-handler.service';
import { MongoDbService } from './db/mongodb.service';

@Module({
  controllers: [MessageController],
  providers: [MessageService, BotResponseService, ClientHandlerService, MongoDbService],
  imports: [
    MongooseModule.forFeature([
      {
        name: Message.name,
        schema: MessageSchema,
      },
    ]),
    NotificationModule,
    ProviderModule,
    ChatgtpModule,
    CohereModule
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
