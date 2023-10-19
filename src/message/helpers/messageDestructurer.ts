import { WspReceivedMessageDto } from "src/message/dto/wspReceivedMessage.dto";
import { IParsedMessage } from "../entities/parsedMessage";

export const messageDestructurer = (messageDto: WspReceivedMessageDto) => {
    const parsedMessage: IParsedMessage = {
        clientName: '',
        clientPhone: '',
        type: '',
        content: {}
    }
    const contact = messageDto.entry[0].changes[0].value.contacts[0];
    const message = messageDto.entry[0].changes[0].value.messages[0];

    parsedMessage.clientName = contact.profile.name;
    parsedMessage.clientPhone = contact.wa_id;
    parsedMessage.type = message.type;

    switch (message.type) {
      case 'interactive':
        const interactiveType = message.interactive.type;
        if (interactiveType === 'button_reply') {
          parsedMessage.content = {
            title: message.interactive['button_reply'].title,
            id: message.interactive['button_reply'].id,
          };
          break;
        } else if (interactiveType === 'list_reply') {
          parsedMessage.content = {
            title: message.interactive["list_reply"].title,
            id: message.interactive["list_reply"].id,
            description: message.interactive["list_reply"].description,
          };
        }
        break;
      case 'text':
        parsedMessage.content = message.text.body;
        break;
      default:
        return;
    }

    return parsedMessage;
};