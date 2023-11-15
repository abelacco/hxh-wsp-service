import { Injectable } from '@nestjs/common';
import { validateDNI, validateRUC } from '../utils/validation';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from '../enums/event.enum';
import { WspMessage } from 'src/provider/types/wsp-message.interface';

@Injectable()
export class MarketerHandler {
    
    constructor(
        private eventEmitter: EventEmitter2
    ) {}

    public handleTextMessage(data: WspMessage) {
        console.log('handler MARKETER_TEXT_MESSAGE');

        let message = data.message.text.body;

        if (validateRUC(message) || validateDNI(message)) {
            message = 'RUC/DNI';
        }

        switch (message) {
            case 'bot':
                this.eventEmitter.emit(Event.MARKETER_WELCOME, data);
                break;
            case 'RUC/DNI':
                /**
                 * TODO:
                 * Acceder a la funcion que verifica la identidad del negocio/persona
                 * y en base a la respuesta emitir el evento para pedir el nombre del
                 * negocio en caso exitoso, en caso contrario volver a emitir el evento
                 * que vuelve a mandar el mensaje, pidiendo el DNI/Ruc
                 */
                this.eventEmitter.emit(Event.MARKETER_REQUEST_BUSINESS_NAME, data);
                break;
            case '12345':
                this.eventEmitter.emit(Event.MARKETER_SUCCESS_CONFIRM)
                break;
            default:
                this.eventEmitter.emit(Event.MARKETER_REQUEST_BUSINESS_LOCATION, data);
                break;
        }
    }
    
    public async handleButtonReplyMessage(data: any) {
        console.info('handler MARKETER_BUTTON__REPLY_MESSAGE');

        const button_id = data.message.button_reply.id

        switch (button_id) {
            case 'step-1-continuar':
                console.log('boton CONTINUAR recibido');
                this.eventEmitter.emit(Event.MARKETER_REQUEST_RUC_DNI, data);
                break;
            case 'step-1-cancelar':
                /**
                 * TODO:
                 * Emitir el evento que lanza un mensaje de despedida y
                 * eliminar el registro Marketer de la base de datos
                 */
                console.log(button_id);
                break;
            default:
                console.log('boton desconocido');
                break;
        }
    }

    public async handleLocationMessage(data:any) {
        console.log('handler MARKETER_LOCATION_MESSAGE');
        this.eventEmitter.emit(Event.MARKETER_REQUEST_QR_CODE, data);
    }
}