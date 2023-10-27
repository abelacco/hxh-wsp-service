import { Body, Controller, Post } from '@nestjs/common';
import { ConfirmPaymentDto } from './dto/confirmPayment.dto';
import { PaymentService } from './payment.service';

@Controller('payment')
export class PaymentController {
    constructor(
        private readonly paymentService: PaymentService
    ) {}
    @Post()
    paymentCheck(@Body() paymentConfirmation: ConfirmPaymentDto) {
        this.paymentService.updateMessagePayment(paymentConfirmation);

        return 'Ok';
    }
}
