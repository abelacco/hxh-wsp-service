export interface WspNotification {
    metadata:              Metadata;
    contacts:              null;
    WABA_ID:               string;
    isNotificationMessage: boolean;
    isMessage:             boolean;
    notificationType:      string;
    notificationMessage:   NotificationMessage;
}

export interface Metadata {
    display_phone_number: string;
    phone_number_id:      string;
}

export interface NotificationMessage {
    id:           string;
    status:       string;
    timestamp:    string;
    recipient_id: string;
    conversation: Conversation;
    pricing:      Pricing;
    from:         From;
}

export interface Conversation {
    id:                   string;
    expiration_timestamp: string;
    origin:               string;
}

export interface From {
    name:  null;
    phone: string;
}

export interface Pricing {
    billable:      boolean;
    pricing_model: string;
    category:      string;
}