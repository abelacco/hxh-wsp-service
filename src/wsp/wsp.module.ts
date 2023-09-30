import { Module } from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspController } from './wsp.controller';

@Module({
  controllers: [WspController],
  providers: [WspService]
})
export class WspModule {}
