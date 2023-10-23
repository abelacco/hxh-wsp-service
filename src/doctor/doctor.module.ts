import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { BotResponseService } from 'src/message/bot-response/bot-response.service';

@Module({
    exports: [DoctorService],
    providers: [DoctorService, BotResponseService],
})
export class DoctorModule {}
