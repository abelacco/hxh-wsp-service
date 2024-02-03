import { WspReceivedMessageDto } from "src/message/dto/wspReceivedMessage.dto";
import { IParsedMessage } from "../entities/parsedMessage";
import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from "src/message/helpers/constants";

export const messageDestructurer = (messageDto: WspReceivedMessageDto) => {
  console.log('DESTRUCTURER', messageDto);
    const parsedMessage: IParsedMessage = {
        clientName: '',
        clientPhone: '',
        type: '',
        content: {}
    }
    const contact = messageDto.entry[0].changes[0].value.contacts[0];
    console.log('contact',contact);
    const message = messageDto.entry[0].changes[0].value.messages[0];
    console.log('message',message);
    parsedMessage.clientName = contact.profile.name;
    parsedMessage.clientPhone = contact.wa_id.startsWith('52') ? contact.wa_id.replace('521', '52') : contact.wa_id;
    parsedMessage.type = message.type;
    console.log('message',message.type);
    switch (message.type) {
      case WSP_MESSAGE_TYPES.INTERACTIVE:
        const interactiveType = message.interactive.type;
        if (interactiveType === INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY) {
          parsedMessage.content = {
            title: message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].title,
            id: message.interactive[INTERACTIVE_REPLIES_TYPES.BUTTON_REPLY].id,
          };
          
          break;
        } else if (interactiveType === INTERACTIVE_REPLIES_TYPES.LIST_REPLY) {
          parsedMessage.content = {
            title: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].title,
            id: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].id,
            description: message.interactive[INTERACTIVE_REPLIES_TYPES.LIST_REPLY].description,
          };
        }
        break;
      case WSP_MESSAGE_TYPES.BUTTON:
          parsedMessage.content = {
            payload: message.button.payload,
            title: message.button.text,
          };
          
          break;
      case WSP_MESSAGE_TYPES.TEXT:
        parsedMessage.content = message.text.body;
        break;
      case WSP_MESSAGE_TYPES.IMAGE:
        parsedMessage.content = message.image.id
        break;
      default:
        return;
    }
    console.log(parsedMessage);
    return parsedMessage;
};