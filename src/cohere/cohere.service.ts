import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class CohereService {
    constructor(private readonly configService: ConfigService) {};
  
    async classyfier(text: string) {
    const body = {
      model: 'embed-multilingual-v2.0',
      inputs: [text],
      examples: [
        { text: 'Hola como estas?', label: 'greetings' },
        { text: 'Buenas', label: 'greetings' },
        { text: 'Buenos dias', label: 'greetings' },
        { text: 'Buenas noches', label: 'greetings' },
        { text: 'Necesito ayuda', label: 'greetings' },
        { text: 'Como funciona', label: 'greetings' },
        { text: 'Que debo hacer', label: 'greetings' },
        { text: 'Realizar una reserva', label: 'greetings' },
        { text: 'Necesito un cuarto', label: 'greetings' },
        { text: 'Soy hotel', label: 'provider' },
        { text: 'Quiero registrarme como dueño de negocio', label: 'provider' },
        { text: 'Quiero registrarme como hotelero', label: 'provider' },
      ],
    };
    const query = await axios.post('https://api.cohere.ai/v1/classify', body, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `BEARER ${this.configService.get<string>('COHERE_API_KEY')}`,
      },
    });
    return query.data.classifications[0].prediction;
  }
}
