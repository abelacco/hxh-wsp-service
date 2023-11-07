import { Controller, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ChatgtpService } from './chatgtp.service';


@Controller('chatgtp')
export class ChatgtpController {
  constructor(private readonly chatgtpService: ChatgtpService) {}

  @Post('')
  async chat(@Body('message') message: string, @Res() res: any) {
    console.log('message', message)
    try {
      const response = await this.chatgtpService.getResponse(message);
      return res.status(200).send({ response });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Ocurrió un error al procesar tu solicitud.');
    }
  }

  @Post('date')
  async getDate(@Body('message') message: string, @Res() res: any) {
    console.log('message', message)
    try {
      const response = await this.chatgtpService.getDateResponse(message);
      return res.status(200).send({ response });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Ocurrió un error al procesar tu solicitud.');
    }
  }

}
