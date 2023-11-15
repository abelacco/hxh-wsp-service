import { WspNotification } from "./wsp-notification.interface";

export interface WspMessage {
    metadata:              Metadata;
    contacts:              Contacts;
    WABA_ID:               string;
    isNotificationMessage: boolean;
    isMessage:             boolean;
    message:               Message;
}

export interface Metadata {
    display_phone_number: string;
    phone_number_id:      string;
}

export interface Message {
    from:       From;
    timestamp:  string;
    text:       Text;
    type:       string;
    thread:     null;
    message_id: string;
}

export interface Contacts {
    profile: Profile;
    wa_id:   string;
}

export interface Profile {
    name: string;
}

export interface From {
    name:  string;
    phone: string;
}

export interface Text {
    body: string;
}