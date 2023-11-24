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
        { text: 'Agendar una cita', label: 'speciality' },
        { text: 'Necesito un doctor', label: 'speciality' },
        { text: 'Quiero un especialista', label: 'speciality' },
        { text: 'Necesito psicólogo', label: 'speciality' },
        { text: 'Necesito nutricionista', label: 'speciality' },
        { text: 'Quiero ver un cirujano', label: 'speciality' },
        { text: 'Me duele', label: 'speciality' },
        { text: 'Tengo dolor', label: 'speciality' },
        { text: 'Soy doctor', label: 'specialist' },
        { text: 'Soy especialista', label: 'specialist' },
        { text: 'Quiero registrarme como doctor', label: 'specialist' },
        { text: 'Quiero registrarme como especialista', label: 'specialist' },
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
