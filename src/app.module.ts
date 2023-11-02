import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { WspModule } from './wsp/wsp.module';
import { MessageModule } from './message/message.module';
import { DoctorModule } from './doctor/doctor.module';
import { NotificationModule } from './notification/notification.module';
import { ChatgtpModule } from './chatgtp/chatgtp.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    WspModule,
    MessageModule,
    DoctorModule,
    NotificationModule,
    ChatgtpModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
