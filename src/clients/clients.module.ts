import { Module } from '@nestjs/common';
import { ClientsService } from './clients.service';

@Module({
    exports: [ClientsService],
    providers: [ClientsService],
})
export class ClientsModule {}
