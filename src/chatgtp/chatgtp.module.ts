import { Module } from '@nestjs/common';
import { ChatgtpService } from './chatgtp.service';
import { ChatgtpController } from './chatgtp.controller';
import { OpenAiProvider } from './chatgtp.provider';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [ChatgtpController],
  providers: [ChatgtpService, OpenAiProvider],
  imports: [ConfigModule],
  exports: [ChatgtpService],
})
export class ChatgtpModule {}
