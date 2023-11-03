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
        { text: 'Hola como estas?', label: 'Greetings' },
        { text: 'Buenas', label: 'Greetings' },
        { text: 'Buenos dias', label: 'Greetings' },
        { text: 'Buenas noches', label: 'Greetings' },
        { text: 'Necesito ayuda', label: 'Greetings' },
        { text: 'Como funciona', label: 'Greetings' },
        { text: 'Que debo hacer', label: 'Greetings' },
        { text: 'Necesito un doctor', label: 'Speciality' },
        { text: 'Quiero un especialista', label: 'Speciality' },
        { text: 'Necesito psicólogo', label: 'Speciality' },
        { text: 'Necesito nutricionista', label: 'Speciality' },
        { text: 'Quiero ver un cirujano', label: 'Speciality' },
        { text: 'Me duele', label: 'Speciality' },
        { text: 'Tengo dolor', label: 'Speciality' },
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
