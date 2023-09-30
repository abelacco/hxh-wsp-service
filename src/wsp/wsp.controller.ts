import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { WspService } from './wsp.service';
import { CreateWspDto } from './dto/create-wsp.dto';
import { WspQueriesDto } from './dto/queries-webhook';

@Controller('wsp')
export class WspController {
  constructor(private readonly wspService: WspService) {}

  @Post('/webHook')
  create(@Body() messageWSP: any) {
    return this.wspService.addMessage(messageWSP);
  }

  @Get('/webHook')
  find(@Query() wspQueries: WspQueriesDto) {
    return this.wspService.validateWebHook(wspQueries);
  }


}
