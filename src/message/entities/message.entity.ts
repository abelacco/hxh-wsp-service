import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { STEPS } from "src/config/constants";

@Schema()
export class Message extends Document {

    @Prop({
        // index: true
    })
    clientId: string;

    @Prop({
        // index: true
    })
    appointmentId: string;
    
    @Prop({
        // index: true
    })
    clientName: string;

    @Prop({
        // index: true
    })
    doctorId: string;

    @Prop({
        // index: true
    })
    speciality: string;

    @Prop({
        // required: true,
        unique: true,
        // index: true
    })
    phone: string;

    @Prop({
        // index: true
    })
    doctorPhone: string;

   @Prop({
        // required: true,
        // index: true
    })
    date: Date;

    @Prop({
        // required: true,
        // index: true
        type: String,
        enum: STEPS,
        default: STEPS.INIT
    })
    step: string;
    @Prop({
        // required: true,
        // index: true
    })
    message: string;

    @Prop({
        // required: true,
        // index: true
    })
    status: string;

    @Prop({
        // required: true,
        // index: true
        default: 0
    })
    attempts: number;

    @Prop({
        // required: true,
        // index: true
    })
    imageVoucher: string;

    @Prop({
        // required: true,
        // index: true
    })
    fee: number;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
