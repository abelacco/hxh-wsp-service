import { Module } from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspController } from './wsp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/message/entities/message.entity';
import { NotificationModule } from 'src/notification/notification.module';
import { MessageModule } from 'src/message/message.module';
import { DoctorModule } from 'src/doctor/doctor.module';

@Module({
  controllers: [WspController],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    NotificationModule,
    MessageModule,
    DoctorModule
  ],
  providers: [WspService],
  exports: [WspService]
})
export class WspModule {}
