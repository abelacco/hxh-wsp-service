import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ConsoleLogger,
  Res,
  HttpCode,
} from '@nestjs/common';
import { WspService } from './wsp.service';
import { CreateWspDto } from './dto/create-wsp.dto';
import { WspQueriesDto } from './dto/queries-webhook';
import { Response } from 'express';
import { WspReceivedMessageDto } from 'src/message/dto/wspReceivedMessage.dto';

@Controller('wsp')
export class WspController {
  constructor(private readonly wspService: WspService) {}

  @Post('/webHook')
  @HttpCode(200)
  async proccess(@Body() messageWSP: WspReceivedMessageDto) {
    try {
      await this.wspService.proccessMessage(messageWSP);
      return 'OK';
    } catch (error) {
      return 'OK';
    }
  }

  @Get('/webHook')
  find(@Query() wspQueries: WspQueriesDto) {
    return this.wspService.validateWebHook(wspQueries);
  }

  @Post('/sendMessage')
  sendMessage(@Body() botResponse: any) {
    console.log('CONTROLLER - Iniciando proceso de mensaje', botResponse);
    return this.wspService.sendMessages(botResponse);
  }
}
