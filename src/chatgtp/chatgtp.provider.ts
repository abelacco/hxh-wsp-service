import { ConfigService } from '@nestjs/config';
import OpenAI, { ClientOptions } from 'openai';

export const OpenAiProvider = {
    provide: 'OPENAI',
    useFactory: (configService: ConfigService) => {
        const options: ClientOptions = {
            apiKey: configService.get<string>('OPENAI_API_KEY'),
        };
        return new OpenAI(options);
    },
    inject: [ConfigService],
};

