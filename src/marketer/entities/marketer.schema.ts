import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";
import { Status } from "../enums/status.enum";

export class Ubication {
    @IsString()
    @IsNotEmpty()
    latitude: String;

    @IsString()
    @IsNotEmpty()
    longitude: String;

    @IsString()
    @IsNotEmpty()
    name: String;

    @IsString()
    @IsNotEmpty()
    address: String;
}

export type MarketerDocument = HydratedDocument<Marketer>;

@Schema()
export class Marketer {
    @Prop({
        required: true
    })
    wa_id: String;

    @Prop()
    profile: String

    @Prop({
        required: true,
        enum: Status
    })
    status: Status = Status.INCOMPLETE;

    @Prop()
    DNI: String; // 17982859370AZ

    @Prop()
    RUC: String; // 1798285937001

    @Prop()
    name: String;

    @Prop()
    image: String;

    @Prop(raw({
        latitude: { type: String },
        longitude: { type: String },
        name: { type: String },
        address: { type: String }
    }))
    ubication: Ubication;

    @Prop()
    qrCode: String;
}

export const MarketerSchema = SchemaFactory.createForClass(Marketer);