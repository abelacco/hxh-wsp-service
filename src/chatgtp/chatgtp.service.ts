// import { Injectable, Inject } from '@nestjs/common';
// import OpenAI from 'openai';


// @Injectable()
// export class ChatgtpService {

//   constructor(@Inject('OPENAI') private openai: OpenAI) {}


//   // async getResponse(messages: Array<{ role: string; content: string }>): Promise<string> {
//   async getResponse(messages:string): Promise<string> {
//     const systemMessage = "Usted está hablando con un asistente médico virtual. Describa sus síntomas y le ayudaré a encontrar el especialista adecuado para usted.";
//     const payload = [
//       { "role": 'system', "content": systemMessage },
//       { "role": 'user', "content": messages }
//     ];
//     const requestPayload:any = {
//       model: 'gpt-3.5-turbo',
//       messages:payload,
//       max_tokens: 150,
//     };

//     try {
//       const response = await this.openai.chat.completions.create(requestPayload);
//       console.log('response', response.choices[0].message.content.trim());
//       return response.choices[0].message.content.trim();
//     } catch (error) {
//       console.error('Error al llamar a OpenAI:', error);
//       throw new Error('Error al procesar la solicitud');
//     }
//   }

// }
// import { Injectable, Inject } from '@nestjs/common';
// import OpenAI from 'openai';

// @Injectable()
// export class ChatgtpService {
//   private messageHistory: { role: string; content: string }[] = [];
//   private maxQuestions = 3;

//   constructor(@Inject('OPENAI') private openai: OpenAI) {}

//   async getResponse(userMessage: string): Promise<string> {
//     const systemMessage = "Usted está hablando con un asistente médico virtual. Describa sus síntomas y le ayudaré a encontrar el especialista adecuado para usted.";

//     if (this.messageHistory.length === 0) {
//       this.messageHistory.push({ role: 'system', content: systemMessage });
//     }

//     this.messageHistory.push({ role: 'user', content: userMessage });

//     const requestPayload:any = {
//       model: 'gpt-3.5-turbo',
//       messages: this.messageHistory,
//       max_tokens: 150,
//     };

//     try {
//       const response = await this.openai.chat.completions.create(requestPayload);
//       const botResponse = response.choices[0].message.content.trim();
//       this.messageHistory.push({ role: 'assistant', content: botResponse });

//       if (this.messageHistory.length >= this.maxQuestions * 2) {
//         const recommendation = "Basado en los síntomas que ha descrito, le recomendaría consultar a un [nombre de la especialidad] para una evaluación más precisa. Es importante que hable con un médico en persona para obtener un diagnóstico adecuado y el tratamiento necesario.";
//         this.messageHistory = []; // Limpia el historial para la próxima conversación
//         return recommendation;
//       }

//       return botResponse + "\n\nRecuerde, siempre es importante consultar a un médico para obtener un diagnóstico y tratamiento adecuados.";
//     } catch (error) {
//       console.error('Error al llamar a OpenAI:', error);
//       throw new Error('Error al procesar la solicitud');
//     }
//   }
// }

import { Injectable, Inject } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatgtpService {
  private messageHistory: { role: string; content: string }[] = [];
  private maxQuestions = 3;

  constructor(@Inject('OPENAI') private openai: OpenAI) {}

  async getResponse(userMessage: string): Promise<{response:string , specialist?:string}> {
    const systemMessage = "Usted está hablando con un asistente médico virtual. Describa sus síntomas y le ayudaré a encontrar el especialista adecuado para usted.";

    if (this.messageHistory.length === 0) {
      this.messageHistory.push({ role: 'system', content: systemMessage });
    }

    this.messageHistory.push({ role: 'user', content: userMessage });

    if (this.messageHistory.length >= this.maxQuestions * 2) {
      // Preguntar a OpenAI sobre el especialista basado en los síntomas descritos
      const specialistQuestion = "Dado los síntomas descritos, ¿a qué tipo de especialista médico debería referir a esta persona?";
      this.messageHistory.push({ role: 'assistant', content: specialistQuestion });
      
      const specialistResponse = await this.askOpenAI();
      const recommendation = `Basado en los síntomas que ha descrito, le recomendaría consultar a un ${specialistResponse} para una evaluación más precisa. Por favor, agende su cita lo antes posible. Una vez agendada, le proporcionaremos la información al especialista.`;

      // Limpia el historial para la próxima conversación
      this.messageHistory = [];

      let finalResponse = {
        response : recommendation + "\n\nRecuerde, siempre es importante consultar a un médico en persona para obtener un diagnóstico y tratamiento adecuados.",
        specialist : specialistResponse
      }
      console.log('finalResponse',finalResponse)
      return finalResponse
    } else {
      const botResponse = await this.askOpenAI();
      return {response: botResponse};
    }
  }

  async getDateResponse(userMessage: string): Promise<string> {
    const currentYear = new Date().getFullYear();
    const systemMessage = `Dada la entrada "${userMessage}", infiere la fecha y hora más probables dentro del rango de las 8:00 AM a las 8:00 PM, en formato de 12 o 24 horas. Formatea la respuesta en DD-MM-YY HH:MM a, siendo el año ${currentYear}. Si la hora necesita redondeo, redondéala a la próxima media hora o hora en punto. Si no es posible determinar una fecha y hora exactas, proporciona la mejor estimación posible basada en la información disponible, sin devolver 404. Considera que el usuario puede escribir la hora con o sin minutos exactos y en formato de 12 horas (con am/pm) o 24 horas.`;

    this.messageHistory.push({ role: 'system', content: systemMessage });

    const chatGptAnswer = await this.askOpenAI();
    console.log("chat answerr",chatGptAnswer)

    return chatGptAnswer;
  }

  private async askOpenAI(): Promise<string> {
    const requestPayload:any = {
      model: 'gpt-3.5-turbo',
      messages: this.messageHistory,
      max_tokens: 30,
    };

    try {
      const response = await this.openai.chat.completions.create(requestPayload);
      let botResponse = response.choices[0].message.content.trim();
  
      // if (this.messageHistory.length < this.maxQuestions * 2) {
      //   // Si aún no se han hecho suficientes preguntas, invitamos a hacer más preguntas.
      //   botResponse += "\n\n¿Hay algo más sobre lo que pueda preguntar o desea que le recomiende un especialista basándome en la información proporcionada hasta ahora?";
      // }
  
      // this.messageHistory.push({ role: 'assistant', content: botResponse });
      return botResponse;
    } catch (error) {
      console.error('Error al llamar a OpenAI:', error);
      throw new Error('Error al procesar la solicitud');
    }
  }
}
