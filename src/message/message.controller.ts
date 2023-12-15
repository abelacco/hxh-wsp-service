import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaymentStatusDto } from 'src/wsp/dto/paymentStatus.dto';
import { EndpointResponse } from 'src/common/models/endpoint-response';
import { errorHandler } from 'src/common/hepers/errorHandler';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post('/paymentStatus')
  updateStatus(@Body() paymentConfirmation: PaymentStatusDto) {
    const response = new EndpointResponse();
    try {
      this.messageService.updateStatus(paymentConfirmation);
      response.success = 1;
      response.message = 'Message updated successfully';
      return response;
    } catch (error) {
      response.success = 0;
      response.message = 'Message could not be updated';
      errorHandler(error.code, response)
    }
  }

  // @Post()
  // create(@Body() createMessageDto: CreateMessageDto) {
  //   return this.messageService.create(createMessageDto);
  // }

  // @Get()
  // findAll() {
  //   return this.messageService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.messageService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateMessageDto: UpdateMessageDto) {
  //   return this.messageService.update(+id, updateMessageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.messageService.remove(+id);
  // }

  // @Post('testdate')
  // testDate(@Body() body) {
  //   console.log('body', body);
  //   return this.messageService.testDate(body.date);
  // }
}
