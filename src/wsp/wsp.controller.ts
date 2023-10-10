import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ConsoleLogger } from '@nestjs/common';
import { WspService } from './wsp.service';
import { CreateWspDto } from './dto/create-wsp.dto';
import { WspQueriesDto } from './dto/queries-webhook';

@Controller('wsp')
export class WspController {
  constructor(private readonly wspService: WspService) {}

  @Post('/webHook')
  proccess(@Body() messageWSP: any) {
    console.log(" CONTROLLER - Iniciando proceso de mensaje")
    return this.wspService.proccessMessage(messageWSP);
  }

  @Get('/webHook')
  find(@Query() wspQueries: WspQueriesDto) {
    return this.wspService.validateWebHook(wspQueries);
  }

  @Post('/sendMessage')
  sendMessage(@Body() botResponse: any) {
    console.log("CONTROLLER - Iniciando proceso de mensaje", botResponse)
    return this.wspService.sendMessages(botResponse);
  }


}
