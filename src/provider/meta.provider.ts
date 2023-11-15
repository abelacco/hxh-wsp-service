import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse, AxiosError} from 'axios';
import { messageParser } from './utils/messageParser';
import { FetchAssistantBody } from './types/fetch-body.interface';
import { WspButton } from './types/wsp-button.interface';

@Injectable()
export class MetaProvider {
    private WABA_ID = process.env.META_WA_wabaId;
    private accessToken = process.env.CURRENT_ACCESS_TOKEN;
    private baseUrl = `${process.env.META_BASE_URL}/${process.env.PHONE_ID}`;

  parseMessage(requestBody: any) {
    console.info('metaProvider -> parseMessage');
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }

  public async sendText({ message, clientPhone}) {
    const body = {
      messaging_product: 'whatsapp',
      to: clientPhone,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    }

    const response = await this.fetchAssistan({
      url: '/messages',
      method: 'POST',
      body,
    });

    return response;
  }

  public async sendSimpleButtons({ clientPhone, message, listOfButtons }: { clientPhone: string, message: string, listOfButtons: Array<WspButton>}) {
    if (listOfButtons.length > 3) {
      throw new Error('ERROR: El maximo de botones que se pueden enviar son 3');
    }

    const validButtons = listOfButtons.map((button: WspButton) => {
      /**
       * Primero verificamos que los buttons no infrinjan las restricciones
       * de la WhatsApp Cloud API en cuanto a los mensajes con botones
       */
      if (button.title.length > 20) {
        throw new Error('La longitud del titulo del button debe estar entre 1 y 20 caracteres');
      }

      if (button.id.length > 256) {
        throw new Error('La longitud del id del button debe estar entre 1 y 256 caracteres');
      }

      /**
       * Si cumplen, armamos la plantilla de cada button
       */
      return {
        type: 'reply',
        reply: {
          title: button.title,
          id: button.id
        }
      }
      // Esta linea filtra los valores null y undefined
      // de forma que los elimina del arreglo de buttons
    }).filter(Boolean);

    /**
     * Y finalmente armamos la plantilla completa para mensajes
     * de tipo buttons pasandole los valores recibidos y nuestros
     * botones parseados
     */
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: clientPhone,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: message
        },
        action: {
          buttons: validButtons
        }
      }
    }

    const response = await this.fetchAssistan({
      url: '/messages',
      method: 'POST',
      body
    });

    return response;
  }

  public async sendLocation({ clientPhone, latitude, longitude, name, address }: { clientPhone: string, latitude: string, longitude: string, name: string, address: string }) {
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: clientPhone,
      type: 'location',
      location: {
        latitude,
        longitude,
        name,
        address
      }
    }

    const response = await this.fetchAssistan({
      url: '/messages',
      method: 'POST',
      body
    });

    return response;
  }

  public async getWhatsappMediaUrl(imageId: string) {
    console.info('metaProvider -> getWhatsappMediaUrl');
    const getImage = await axios.get(
      `https://graph.facebook.com/v16.0/${imageId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
        },
      },
    );
    const imageUrl = await getImage.data.url;
    return imageUrl;
  }

  private async fetchAssistan({ baseUrl, url, method, headers, body}: FetchAssistantBody) {
    console.log('metaProvider -> fetchAssitant');
    /**
     * Devolvemos una Promise, ya que esta se resuelve o se rechaza
     * en base a ciertas condiciones dentro de nuestra funcion fetchAssistan
     */
    return new Promise((resolve, reject) => {

      /**
       * ? defaultHeaders:
       * Es un objeto que construye una plantilla de encabezado por
       * defecto para la peticion http. Esto para el caso en que la
       * funcion fetchAssistan no recibe ningun 'headers' en los
       * parametros
       */
      const defaultHeaders = () => {
        let output = {
          'Content-Type': 'application/json',
          'Accept-Language': 'en_US',
          Accept: 'application/json',
        };

        /**
         * Esto inyecta el token de autorizacion en el objeto
         * output para finalmente retornar todo el output
         */
        if (this.accessToken) {
          output['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return output;
      };

      const defaultBody = {};
      const defaultMethod = 'GET';

      /**
       * Construimos los objetos necesarios para una peticion HTTP
       */
      method = method?.toUpperCase() ?? defaultMethod;
      headers = {
        ...defaultHeaders(),
        ...headers,
      }
      body = body ?? defaultBody;
      this.baseUrl = baseUrl ?? this.baseUrl;
      const fullUrl = `${this.baseUrl}${url}`;

      axios({
        method,
        url: fullUrl,
        headers,
        data: body
      })
      .then((res: AxiosResponse) => {
        /**
         * Si la peticion se ejecuto de manera exitosa, resolvemos
         * la promesa como succes y devolvemos la data
         */
        resolve({
          status: 'success',
          data: res.data
        })
      })
      .catch((error: AxiosError) => {
        /**
         * Caso contrario, capturamos los diferentes errores
         * posibles, resolvemos la promesa como 'failed' y le
         * enviamos los errores en el objeto errorObject
         */
        let errorObject = {};

        if (error.response) {
          /**
           * La peticion se realizo, pero el servidor respondio con
           * un codigo HTTP que no esta en el rango de los codigos
           * 200, por lo que se considera un error.
           */
          errorObject['error'] = error.response.data;
        } else if (error.request) {
          /**
           * La peticion fue hecha, pero no se recibio
           * ninguna respuesta por parte del servidor
           */
          errorObject['error'] = 'No response received';
        } else {
          /**
           * Ocurrio algo al momento de configurar la
           * solucitud, lo cual lanzo un error
           */
          errorObject['error'] = error.message;
        }

        reject({
          status: 'failed',
          ...errorObject
        });
      })
    })
  }
}