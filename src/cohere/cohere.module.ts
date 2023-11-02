import { Module } from '@nestjs/common';
import { CohereService } from './cohere.service';
import { ConfigService } from '@nestjs/config';

@Module({
  providers: [CohereService, ConfigService],
  exports: [CohereService],
})
export class CohereModule {}
