import { Module } from '@nestjs/common';
import { ProviderService } from './provider.service';

@Module({
    exports: [ProviderService],
    providers: [ProviderService],
})
export class DoctorModule {}
