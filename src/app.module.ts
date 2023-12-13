import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvConfiguration } from './config/app.config';
import { JoiValidationSchema } from './config/joi.validation';
import { WspModule } from './wsp/wsp.module';
import { MessageModule } from './message/message.module';
import { ProviderModule } from './providers/provider.module';
import { ClientsModule } from './clients/clients.module';
import { NotificationModule } from './notification/notification.module';
import { ChatgtpModule } from './chatgtp/chatgtp.module';
import { CohereModule } from './cohere/cohere.module';
import { MarketerModule } from './marketer/marketer.module';
import { MarketerBotMiddleware } from './middlewares/marketer-bot.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema
    }),
    MongooseModule.forRoot(process.env.MONGODB),
    WspModule,
    MessageModule,
    ProviderModule,
    NotificationModule,
    ChatgtpModule,
    CohereModule,
    MarketerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(MarketerBotMiddleware)
      .forRoutes({ path: 'wsp/webHook', method: RequestMethod.ALL });
  }
}
