import { Body, Controller, Post } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { PaymentStatusDto } from './dto/paymentStatus.dto';

@Controller('notification')
export class NotificationController {
    constructor(
        private readonly notificationService: NotificationService
    ) {}
}
