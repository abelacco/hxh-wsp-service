import { WspReceivedMessageDto } from "src/message/dto/wspReceivedMessage.dto";
import { IParsedMessage } from "../entities/parsedMessage";
import { INTERACTIVE_REPLIES_TYPES, WSP_MESSAGE_TYPES } from "./constants";

export const messageDestructurer = (messageDto: WspReceivedMessageDto) => {
    const parsedMessage: IParsedMessage = {
        clientName: '',
        clientPhone: '',
        type: '',
        content: {}
    }
    const {BUTTON_REPLY, LIST_REPLY} = INTERACTIVE_REPLIES_TYPES
    const {TEXT, INTERACTIVE, IMAGE} = WSP_MESSAGE_TYPES
    const contact = messageDto.entry[0].changes[0].value.contacts[0];
    const message = messageDto.entry[0].changes[0].value.messages[0];
console.log('message', message);
    parsedMessage.clientName = contact.profile.name;
    parsedMessage.clientPhone = contact.wa_id;
    parsedMessage.type = message.type;
console.log('message.type', message.type);
console.log('message.INTERACTIVE', INTERACTIVE);

    switch (message.type) {
      case INTERACTIVE:
        console.log('message.interactive', message.interactive.type , BUTTON_REPLY);
        const interactiveType = message.interactive.type;
        if (interactiveType === BUTTON_REPLY) {
          parsedMessage.content = {
            title: message.interactive[BUTTON_REPLY].title,
            id: message.interactive[BUTTON_REPLY].id,
          };
          console.log('parsedMessage in Replyt', parsedMessage)
          break;
        } else if (interactiveType === LIST_REPLY) {
          parsedMessage.content = {
            title: message.interactive[LIST_REPLY].title,
            id: message.interactive[LIST_REPLY].id,
            description: message.interactive[LIST_REPLY].description,
          };
        }
        break;
      case TEXT:
        parsedMessage.content = message.text.body;
        break;
      case IMAGE:
        parsedMessage.content = message.image.id
        break;
      default:
        return;
    }
    console.log('parsedMessageindestrcuturer', parsedMessage);
    return parsedMessage;
};