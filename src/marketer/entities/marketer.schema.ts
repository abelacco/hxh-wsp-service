import { Prop, Schema, SchemaFactory, raw } from "@nestjs/mongoose";
import { IsNotEmpty, IsString } from "class-validator";
import { HydratedDocument } from "mongoose";
import { Status } from "../enums/status.enum";

export class Ubication {
    @Prop()
    latitude: String;

    @Prop()
    longitude: String;

    @Prop()
    name: String;

    @Prop()
    address: String;
}

export type MarketerDocument = HydratedDocument<Marketer>;

@Schema()
export class Marketer {
    @Prop({
        required: true
    })
    wa_id: String; // Numero del telefono del Hunter (proporcionado por la API de WhatsApp)

    @Prop({
        required: true,
        enum: Status
    })
    status: Status = Status.INCOMPLETE; // Propiedad para mantener el bucle de las peticiones el Hunter

    @Prop()
    documentId: String; // Propiedad que almacena el RUC o el DNI.

    @Prop()
    fullname: String; // Nombre del negocio

    @Prop()
    phoneBusiness: String; // Telefono del negocio

    @Prop({
        type: Ubication,
        required: true
    })
    ubication: Ubication; // Ubicacion GPS del negocio
    
    @Prop()
    imageUrl: String; // Foto de la parte del negocio donde se pego el codigo QR

    @Prop()
    qrCode: String; // Codigo del QR de afiliacion
}

export const MarketerSchema = SchemaFactory.createForClass(Marketer);