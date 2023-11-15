import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketerController } from './marketer.controller';
import { Marketer, MarketerSchema } from './entities/marketer.schema';
import { MarketerService } from './marketer.service';
import { MetaModule } from 'src/provider/meta.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Marketer.name, schema: MarketerSchema }
        ]),
        MetaModule
    ],
    providers: [MarketerService],
    controllers: [MarketerController],
    exports: [MarketerService]
})
export class MarketerModule {}