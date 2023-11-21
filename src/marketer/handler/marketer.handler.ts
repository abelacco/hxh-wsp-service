import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { WspMessage } from 'src/provider/types/wsp-message.interface';
import { MarketerEvents } from '../events/marketer.event';

@Injectable()
export class MarketerHandler {
    
    constructor(
        private readonly marketerEvents: MarketerEvents
    ) {}

    public async handleTextMessage(req: Request, data: WspMessage) {
        console.log('handler MARKETER_MESSAGE');

        let message = req.marketerField;

        switch (message) {
            case 'bot':
                await this.marketerEvents.sendWelcome(data);
                break;
            case 'step-1-continuar':
                await this.marketerEvents.requestRUCDNI(data);
                break;
            case 'step-1-cancelar':
                await this.marketerEvents.cancelRegister(data);
                break;
            case 'idNumber':
                await this.marketerEvents.validateRUCDNI(data);
                break;
            case 'name':
                await this.marketerEvents.validateName(data);
                break;
            case 'ubication':
                await this.marketerEvents.validateUbication(data);
                break;
            case 'image':
                await this.marketerEvents.validateImage(data);
                break;
            case 'qrCode':
                await this.marketerEvents.validateQrCode(data);
                break;
            default:
                this.marketerEvents.sendError(data);
                console.log('marketer field -> ', req.marketerField);
                console.log('case no controlado -> ', data);
                break;
        }
    }
}