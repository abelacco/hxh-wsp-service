import { STEPS } from 'src/config/constants';
import { Templates } from './templates/textTemplate';
import { Message } from '../entities/message.entity';

export const messageErrorHandler = (message: Message) => {
  const numberOfAttemptsAlert = 3;
  const step = message.step;
  const clientPhone = message.clientPhone;
  const responses: Array<any> = [
    Templates.defaultMessageTemplate(clientPhone),
  ];
  if (message.attempts % numberOfAttemptsAlert === 0) {
    const resetQuestionMessage = Templates.resetQuestions(clientPhone);
    responses.push(resetQuestionMessage);
  }
  switch (step) {
    // case STEPS.SELECT_SPECIALTY:
    //   responses.push(Templates.generateSpecialitiesList(clientPhone));
    //   break;
    case STEPS.INSERT_DATE:
      responses.push(Templates.dateStepTemplateMessage(clientPhone));
      break;
    case STEPS.SELECT_PAYMENT:
      responses.push(Templates.generatePaymentOptions(clientPhone));
      break;
    default:
      return responses;
  }
  return responses;
};
