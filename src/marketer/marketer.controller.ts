import {
    Controller,
    HttpCode,
    Get,
    Post,
} from '@nestjs/common';
import { Res, Req } from '@nestjs/common';
import { Request, Response } from 'express';
import { MetaProvider } from 'src/provider/meta.provider';
import { WspMessage } from 'src/provider/types/wsp-message.interface';
import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from '../provider/constants/wsp-constants';
import { MarketerHandler } from './handler/marketer.handler';

@Controller('marketer-bot')
export class MarketerController {

    constructor(
        private readonly metaProvider: MetaProvider,
        private marketerHandler: MarketerHandler
    ) {}
    
    @Post()
    @HttpCode(200)
    public async incomingMessage(@Req() req: Request, @Res() res: Response) {
        try {
            const data: WspMessage = this.metaProvider.parseMessage(req.body);

            if (data?.isMessage) {
                switch (data.message.type) {
                    case WSP_MESSAGE_TYPES.TEXT:
                        this.marketerHandler.handleTextMessage(req, data);
                        break;
                    case INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY:
                        this.marketerHandler.handleButtonReplyMessage(data)
                        break;
                    case WSP_MESSAGE_TYPES.LOCATION:
                        this.marketerHandler.handleLocationMessage(data);
                        break;
                    default:
                        console.log('Tipo de mensaje no identificado');
                        break;
                }
            }
            
            console.log('-------------------------------------');
            return res.status(200).send('OK');
        } catch (error) {
            console.error(error);
            return res.status(500).send('Internal Server Error');
        }
    }

    @Get()
    public verifyToken(@Req() req: Request, @Res() res: Response) {
        console.log('Verificacion del token');
        const { query } = req;
        const mode = query?.['hub.mode'];
        const token = query?.['hub.verify_token'];
        const myVerifyToken = process.env.MY_VERIFY_TOKEN;
        const challenge = query?.['hub.challenge'];

        if (!mode || !token) {
            res.status(403).send('No token');
        }

        if (mode === 'subscribe' && token === myVerifyToken) {
            console.info('Webhook verified');
            res.status(200).send(challenge);
            return
        }

        res.status(403).send('Invalid token');
        return
    }

}