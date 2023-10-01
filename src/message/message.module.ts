import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageService } from './message.service';
import { MessageController } from './message.controller';
import { Message, MessageSchema } from './entities/message.entity';
import { BotResponseService } from './bot-response/bot-response.service';
import { WspService } from 'src/wsp/wsp.service';
import { WspModule } from 'src/wsp/wsp.module';

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
  ],
  exports: [MongooseModule, MessageService, BotResponseService],
})
export class MessageModule {}
