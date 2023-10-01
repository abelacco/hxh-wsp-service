import { Module } from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspController } from './wsp.controller';
import { BotResponseService } from 'src/message/bot-response/bot-response.service';
import { MessageService } from 'src/message/message.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/message/entities/message.entity';

@Module({
  controllers: [WspController],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }])
  ],
  providers: [WspService, BotResponseService, MessageService],
  exports: [WspService]
})
export class WspModule {}
