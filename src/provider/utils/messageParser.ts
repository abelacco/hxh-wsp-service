import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from "../constants/wsp-constants";

export const messageParser = ({ requestBody, currentWABA_ID }) => {
    let WABA_ID = requestBody.entry[0]?.id; // obtenemos el id del objeto request entrante

    if (WABA_ID == 0) {
        /**
         * Verificamos que sea un id valido. NOTA: Esta condicion genera
         * problemas al simular la recepcion de mensajes desde POSTMAN, si se desea, se
         * puede comentar esta instruccion
         */
        console.log('WABA_ID es 0. Parece que estás probando con la suscripción de prueba de Meta. Esto no es realmente un WABA_ID válido. Te recomiendo que envíes un mensaje real desde un número de cliente de whatsapp real.');
    }

    if (!WABA_ID || WABA_ID !== currentWABA_ID) { 
        /**
         * Verifica que el mensaje fue enviado por el servicio de Meta
         * validando que sea un id correcto de este servicio
         */
        throw new Error(
            'WABA_ID no es válido. Sugerencia: el mensaje no está destinado a esta cuenta de Whatsapp Business.'
        );
    }

    if (!requestBody.object || requestBody.object !== 'whatsapp_business_account') {
        /**
         * Verifica que el mensaje entrante sea de parte de WhatsApp y que sea una cuenta de
         * WhattsApp Business. El mensaje se compone de un 'object' y un 'entry', por eso
         * evaluamos ambas propiedades ademas de la propiedad messages, la cual contiene la
         * carga util
         */
        throw new Error('requestBody no es un mensaje de whatsapp válido. Sugerencia: compruebe la propiedad "object"');
    }

    if (!requestBody.entry || !requestBody.entry?.length) {
        throw new Error('requestBody no es un mensaje de whatsapp válido. Sugerencia: compruebe la propiedad "entry"');
    }

    if (!requestBody.entry[0].changes?.length || requestBody.entry[0].changes[0].field !== 'messages') {
        throw new Error('requestBody no es un mensaje de whatsapp válido. Sugerencia: comprueba la propiedad "changes"');
    }

    let metadata = requestBody.entry[0].changes[0].value.metadata;
    /**
     * Verifica si existe un array de 'contacts' dentro del requestBody,
     * y si la longitud de este array es mayor a cero. En caso de que
     * si existe y es mayor a cero, la evaluacion se convierte en true y
     * se asigna el array de 'contacts' a la variable contacts, caso contrario
     * se asgina el valor de null
     */
    let contacts = requestBody.entry[0].changes[0].value.contacts?.length 
        ? requestBody.entry[0].changes[0].value.contacts[0]
        : null;

    /**
     * Misma logica que el anterior. Verifica si existe un array de 'messages'
     * dentro del requestBody y si su longitud es mayor a cero. De igual forma,
     * caso positivo, asigna el arreglo de 'messages' a la variable message,
     * caso negativo, asigna el valor null.
     * 
     * NOTA: Un 'message' es la notificacion de un mensaje recibido por parte de
     * un cliente. Un 'notificationMessage' son notificaciones en base a mensajes
     * que nosostros enviamos al cliente, tales como sent, delivery y seen
     */
    let message = requestBody.entry[0].changes[0].value?.messages?.length
        ? requestBody.entry[0].changes[0].value.messages[0]
        : null;

    /**
     * Exactamente la misma logica que para las variables 'contacts' y 'message'
     */
    let notificationMessage = requestBody.entry[0].changes[0].value?.statuses?.length
        ? requestBody.entry[0].changes[0].value.statuses[0]
        : null;

    /**
     * output es el objeto de respuesta que devuelve esta funcion de parseo y devuelve
     * solo los datos mas relevantes y necesarios del mensaje recibido
     */
    const output: any = {
        metadata,
        contacts,
        WABA_ID,
    };

    if (notificationMessage) {
        console.log('messageParser -> notification', notificationMessage.status);
        /**
         * En caso de que sea un mensaje de tipo 'notificationMessage', setamos las
         * siguientes propiedades al objeto 'output'
         */
        output['isNotificationMessage'] = true; // Nos permite preguntar si se trata de un 'notificationMessage'
        output['isMessage'] = false; // O preguntar si es un 'message'
        output['notificationType'] = notificationMessage.status; // Para saber que tipo de notificacion fue: delivery, sent, seen...
        notificationMessage['from'] = { // Para acceder a los datos del contacto que recibio nuestro mensaje
            name: null, // El nombre del contacto no viene en los datos de un 'notificationMessage'
            phone: notificationMessage.recipient_id, // Numero de telefono del contacto/cliente
        };
        output['notificationMessage'] = notificationMessage; // Asignamos todo el objeto a su propia propiedad en el objeto 'output'
    } else if (message) { // Caso contrario, se trata de un 'message' (Mensaje recivido del cliente)
        console.log('messagePrser -> incoming message');
        output['isNotificationMessage'] = false; // Mismas propiedades que el 'notificationMessage' pero alternadas
        output['isMessage'] = true;

        let msgType: String;

        if (message.type === 'text' && message.referral) { // Mensaje de anuncio con link de referidos
            msgType = 'ad_message';
        } else if (message.type === WSP_MESSAGE_TYPES.TEXT) { // Mensaje de tipo TEXT
            msgType = WSP_MESSAGE_TYPES.TEXT;
        } else if (message.type === 'sticker') { // Mensaje de tipo STICKER
            msgType = 'sticker_message';
        } else if (message.type === WSP_MESSAGE_TYPES.IMAGE) { // Mensaje de tipo IMAGE
            msgType = WSP_MESSAGE_TYPES.IMAGE;
        } else if (message.location) { // Mensaje de tipo LOCATION
            msgType = WSP_MESSAGE_TYPES.LOCATION;
        } else if (message.contacts) { // Mensaje de tipo CONTACT
            msgType = 'contact_message';
        } else if (message.type === 'button') { // Mensaje de tipo BUTTON
            msgType = 'quick_reply_message';
        } else if (message.type === WSP_MESSAGE_TYPES.INTERACTIVE) { // Mensaje de tipo INTERACTIVE
            // Este puede manejar 2 casos
            if (message.interactive?.type === INTERACTIVE_REPLIES_TYPES.LIST_REPLY) { // Cuando se responde a una lista LIST_REPLY (RADIOBUTTON)
                msgType = INTERACTIVE_REPLIES_TYPES.LIST_REPLY;
                message['list_reply'] = message.interactive.list_reply;
            } else if (message.interactive?.type === INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY) { // O cuando se responde a un BUTTON (BUTTON_REPLY)
                msgType = INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY;
                message['button_reply'] = message.interactive.button_reply;
            }
        } else if (message.type === 'unsupported') { // Manejo de mensajes aun no soportados para esta funcion
            msgType = 'unknown_message';
            if (message.errors?.length) {
                console.log({ Q: message.errors });
                output['isNotificationMessage'] = true;
                output['isMessage'] = false;
                notificationMessage = {
                    errors: message.errors,
                };
            }
        }

        /**
         * Finalmente, agregamos el msgType que identificamos a la propiedad type
         * y ademas los datos del contacto que nos envio el mensaje. Todo esto va
         * al objeto 'message'
         */
        message['type'] = msgType;
        message['from'] = {
            name: contacts.profile.name,
            phone: message?.from,
        };

        if (output.isMessage) {
            let thread = null;

            if (message.context) {
                thread = {
                    from: {
                        name: null,
                        phone: message.context?.from,
                        message_id: message.context?.id,
                    },
                };
            }

            output['message'] = {
                ...message,
                thread,
                message_id: message.id || null,
            };

            delete output.message.id; //keep the data light
            delete output.context; //keep the data light
        }
    } else {
        console.warn('Mensaje no identificado');
    }

    return output;
};