import { Injectable } from '@nestjs/common';
import { ConfirmPaymentDto, PaymentStatus } from './dto/confirmPayment.dto';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class PaymentService {
    constructor(
        private readonly messageService: MessageService
    ) {}

    async updateMessagePayment(paymentConfirmation: ConfirmPaymentDto) {
        const id = paymentConfirmation.messageId;
        const message = await this.messageService.findById(id);
        if(paymentConfirmation.status === PaymentStatus.ACCEPTED) {
            message.status = "1"
            // confirm doctor appointment
            // confirm patien appointment
        } else {
            message.status = "2"
            // reject doctor appointment
            // reject patien appointment
        }
        this.messageService.updateMessage(id, message);
    }
}
