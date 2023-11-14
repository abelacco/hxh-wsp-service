import { Injectable } from '@nestjs/common';
import { messageParser } from './utils/messageParser';
import axios from 'axios';

@Injectable()
export class MetaProvider {
  private WABA_ID = process.env.META_WA_wabaId;

  parseMessage(requestBody: any) {
    console.info('metaProvider -> parseMessage');
    return messageParser({ requestBody, currentWABA_ID: this.WABA_ID });
  }
    /**
   * Este metodo envia un mensaje de cualquier tipo al cliente de
   * WhatsApp a traves de la API de Meta
   * @param body Es el payload creado en base al tipo de mensaje
   * que se quiere enviar al usuario
   * @returns 
   */
  public sendMessageMeta(body:any) {
    console.log('metaProvider -> sendMessageMeta');
    try {
      const response = axios.post(`https://graph.facebook.com/v16.0/${process.env.PHONE_ID}/messages`, body,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CURRENT_ACCESS_TOKEN}`,
          },
        },
      )
      .then((response) => {
        console.log('8.- promise response', response.status, response.statusText)
        return response
      })
      .catch((error) => console.error(error));

      return response;
    } catch (error) {
      console.error(error);
    }
  }

  public sendText(number: String, message: String) {
    console.log('metaProvider -> sendText');
    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: number,
      type: 'text',
      text: {
        preview_url: false,
        body: message
      }
    }

    return this.sendMessageMeta(body)
  }

  public async sendButtons(number: String, text: String, buttons: Array<String>) {
    console.info('metaProvider -> sendButtons');
    const parseButtons = buttons.map((btn) => ({
      type: 'reply',
      reply: {
        id: `btn-${btn}`,
        title: btn,
      }
    }));

    const body = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: number,
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: text,
        },
        action: {
          buttons: parseButtons,
        }
      }
    }

    return await this.sendMessageMeta(body);
  }

  async getWhatsappMediaUrl(imageId: string) {
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
}