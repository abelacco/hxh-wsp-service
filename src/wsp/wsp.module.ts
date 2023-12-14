import { Module } from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspController } from './wsp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/message/entities/message.entity';
import { MessageModule } from 'src/message/message.module';

@Module({
  controllers: [WspController],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MessageModule,
  ],
  providers: [WspService],
  exports: [WspService]
})
export class WspModule {}

