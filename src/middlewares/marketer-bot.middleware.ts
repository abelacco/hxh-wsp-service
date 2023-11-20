import { HttpCode, NestMiddleware, Injectable, Req, Res, Next } from "@nestjs/common";
import { Request, Response, NextFunction } from 'express';
import { Status } from "src/marketer/enums/status.enum";
import { MarketerHandler } from "src/marketer/handler/marketer.handler";
import { MarketerService } from "src/marketer/marketer.service";
import { MetaProvider } from "src/provider/meta.provider";
import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from "src/wsp/helpers/constants";

@Injectable()
export class MarketerBotMiddleware implements NestMiddleware {

    constructor (
        private metaProvider: MetaProvider,
        private marketerHandler: MarketerHandler,
        private marketerService: MarketerService
    ) {}

    @HttpCode(200)
    async use(@Req() req: Request, @Res() res: Response, @Next() next: NextFunction) {
        const marketerController = '/marketer-bot';

        try {
            /**
             * 1.- Verificamos que se trate de una peticion de tipo POST
             */
            if (req.method === 'POST') {
                const data: any = this.metaProvider.parseMessage(req.body);
                /**
                 * 2.- En el caso de que si es de tipo POST, ahora verificamos
                 * que sea un mensaje entrante y no una notificacion
                */
                if (data?.isNotificationMessage) {
                    console.log('wsp-notification -> ', data.notificationType);
                    console.log('-----------------------------------------');
                    return res.status(200).send('OK');
                } else if (data?.isMessage) {
                    console.log('midleware message type -> ', data.message.type);
                    const { message, contacts } = data;
                    const { wa_id } = contacts;

                    /**
                     * 3.- Verificamos si el mercadista ya tiene un registro en la
                     * base de datos, si es asi, verificamos que se encuentre en
                     * status COMPLETE, de lo contrario redirigimos el flujo hacia
                     * el marketer-bot para que continue con el proceso de registro.
                     * 
                     * Esto se repetira en bucle hasta que el registro marque su status
                     * como COMPLETE
                     */
                    const marketer: any = await this.marketerService.findByWaId(wa_id);

                    if (marketer && marketer.status === Status.INCOMPLETE) {
                        console.log('middleware marketer found');
                        const keys = Object.keys(marketer._doc).filter(key => !key.startsWith('$'));

                        req.marketerField = keys.find((key) => marketer._doc[key] === "");
                        req.url = marketerController;
                    } else  if (message.type === WSP_MESSAGE_TYPES.TEXT) {
                        /**
                         * 3.1.- El segundo caso para redirigir el flujo es cuando el
                         * mensaje es la clave para acceder al marketer-bot
                         */
                        const { body } = message.text;

                        if (body === 'bot') {
                            req.marketerField = 'bot';
                            req.url = marketerController;
                        }
                    } else if(message.type == INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY) {
                        /**
                         * 3.2.- Y el ultimo caso es cuando se dio click al boton CONTINUAR
                         * donde preguntamos si desea agregar un nuevo registro
                         */
                        const button_id = data.message.button_reply.id;

                        if (button_id === 'step-1-continuar') {
                            req.marketerField = button_id;
                            req.url = marketerController;
                        } else if (button_id === 'step-1-cancelar') {
                            req.marketerField = button_id;
                            req.url = marketerController;
                        }
                    }
                }
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
        /**
         * 4.- Finalmente, si alguna condicion anterior se cumplio, el flujo de la request
         * se redirige hacia el marketer-bot, de lo contrario continua su trayecto normal
         * hacia el wsp controller
         */
        next();
    }
}