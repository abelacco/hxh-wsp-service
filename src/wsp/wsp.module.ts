import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspController } from './wsp.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Message, MessageSchema } from 'src/message/entities/message.entity';
import { MessageModule } from 'src/message/message.module';
import { DoctorModule } from 'src/doctor/doctor.module';
// import { MarketerBotMiddleware } from 'src/middlewares/marketer-bot.middleware';
import { MarketerModule } from 'src/marketer/marketer.module';

@Module({
  controllers: [WspController],
  imports: [
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MessageModule,
    DoctorModule,
    // MarketerModule
  ],
  providers: [WspService],
  exports: [WspService]
})
export class WspModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer.apply(MarketerBotMiddleware).forRoutes('/');
  }
}

