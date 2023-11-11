import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  BadRequestException,
} from '@nestjs/common';
import { WspService } from './wsp.service';
import { WspQueriesDto } from './dto/queries-webhook';
import { WspReceivedMessageDto } from 'src/message/dto/wspReceivedMessage.dto';
import { PaymentStatusDto } from './dto/paymentStatus.dto';
import { EndpointResponse } from 'src/common/models/endpoint-response';
import { errorHandler } from 'src/common/hepers/errorHandler';

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
      throw new BadRequestException('Received');
    }
  }

  @Get('/webHook')
  find(@Query() wspQueries: WspQueriesDto) {
    try {
      return this.wspService.validateWebHook(wspQueries);
    } catch (error) {
      throw new BadRequestException('Received');
    }
  }

  @Post('/sendMessage')
  sendMessage(@Body() botResponse: any) {
    console.log('CONTROLLER - Iniciando proceso de mensaje', botResponse);
    const response = new EndpointResponse();
    try {
      this.wspService.sendMessages(botResponse);
      response.success = 1;
      response.message = "Message sent successfully";
      return response;
    } catch (error) {
      response.success = 0;
      response.message = 'Message could not be sent';
      errorHandler(error.code, response)
    }
  }

  @Post('/paymentStatus')
  updateStatus(@Body() paymentConfirmation: PaymentStatusDto) {
    const response = new EndpointResponse();
    try {
      this.wspService.updateStatus(paymentConfirmation);
      response.success = 1;
      response.message = 'Message updated successfully';
      return response;
    } catch (error) {
      response.success = 0;
      response.message = 'Message could not be updated';
      errorHandler(error.code, response)
    }
  }
}
