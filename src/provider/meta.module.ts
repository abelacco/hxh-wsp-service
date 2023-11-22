import { Module, Global } from '@nestjs/common';
import { MetaProvider } from './meta.provider';

@Global()
@Module({
    imports: [],
    controllers: [],
    providers: [MetaProvider],
    exports: [MetaProvider]
})
export class MetaModule {}