import { IsEnum, IsString } from "class-validator";

export enum PaymentStatus {
    ACCEPTED = "accepted",
    REJECTED = "rejected"
}

export class ConfirmPaymentDto {
    @IsString()
    messageId: string;

    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}