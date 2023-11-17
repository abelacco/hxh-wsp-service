import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { WspService } from 'src/wsp/wsp.service';

@Injectable()
export class NotificationService {
  constructor(@Inject(forwardRef(() => WspService)) private readonly wspService: WspService) {}
  
  async sendNotification(message: any) {
    this.wspService.sendMessages(message);
  }
}
