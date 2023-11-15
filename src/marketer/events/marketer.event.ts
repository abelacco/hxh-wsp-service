import { Injectable } from '@nestjs/common';
import { MetaProvider } from '../../provider/meta.provider';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from '../enums/event.enum';
import { WspMessage } from 'src/provider/types/wsp-message.interface';

@Injectable()
export class MarketerEvents {

    constructor(
        private metaProvider: MetaProvider,
    ) {}

    @OnEvent(Event.MARKETER_WELCOME)
    public async sendWelcome(data: WspMessage) {
        console.log('event MARKETER_WELCOME');
        const { message } = data;
        // const clientPhone = message.from.phone;
        const clientName = message.from.name

        await this.metaProvider.sendSimpleButtons({
            message: `Hola ${clientName}, Bienvenido al sistema de registro de mercadistas. ¿Deseas registrar un nuevo afiliado?`,
            clientPhone: '527731588611',
            listOfButtons: [
                {
                    title: 'CONTINUAR',
                    id: 'step-1-continuar'
                },
                {
                    title: 'CANCELAR',
                    id: 'step-1-cancelar'
                }
            ]
        });
    }

    @OnEvent(Event.MARKETER_REQUEST_RUC_DNI)
    public async requestRUCDNI(data: WspMessage) {
        console.log('event MARKETER_REQUEST_RUC_DNI');
        const { message } = data;
        
        await this.metaProvider.sendText({
            message: 'Ok. A continacion, enviame el DNI o el RUC de tu negocio',
            clientPhone: '527731588611'
        });
    }

    @OnEvent(Event.MARKETER_REQUEST_BUSINESS_NAME)
    public async sendStepThree() {
        await this.metaProvider.sendText({
            message: 'Validando el DNI/RUC...',
            clientPhone: '527731588611'
        });

        await this.metaProvider.sendText({
            message: 'El DNI/RUC es valido. Ahora, por favor, ¿Puedes decirme cual es el nombre de tu negocio?',
            clientPhone: '527731588611'
        });
    }

    @OnEvent(Event.MARKETER_REQUEST_BUSINESS_LOCATION)
    public async sendStepFour() {
        this.metaProvider.sendText({
            message: 'Excelente. Ahora necesito que me compartas la ubicacion GPS de tu negocio',
            clientPhone: '527731588611'
        });
    }

    @OnEvent(Event.MARKETER_REQUEST_QR_CODE)
    public async sendStepFive() {
        await this.metaProvider.sendText({
            message: 'Validando ubicacion, espera un momento...',
            clientPhone: '527731588611',
        });

        await this.metaProvider.sendText({
            message: 'Ubicacion valida. Por ultimo, necesito que me compartas el codigor QR de afiliacion',
            clientPhone: '527731588611'
        });
    }

    @OnEvent(Event.MARKETER_SUCCESS_CONFIRM)
    public async sendStepSix() {
        await this.metaProvider.sendText({
            message: 'Validando codigo QR, espera un momento...',
            clientPhone: '527731588611'
        });

        await this.metaProvider.sendText({
            message: 'Todos los pasos se completaron con exito, mercadista registrado',
            clientPhone: '527731588611'
        });
    }
}