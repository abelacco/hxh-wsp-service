import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service';

@Module({
    exports: [DoctorService],
    providers: [DoctorService],
})
export class DoctorModule {}
