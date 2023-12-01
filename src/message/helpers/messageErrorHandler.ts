import { STEPS } from 'src/config/constants';
import { Templates } from './templates/textTemplate';
import { Message } from '../entities/message.entity';

export const messageErrorHandler = (message: Message) => {
  const numberOfAttemptsAlert = 3;
  const step = message.step;
  const patientPhone = message.phone;
  const responses: Array<any> = [
    Templates.defaultMessageTemplate(patientPhone),
  ];
  if (message.attempts % numberOfAttemptsAlert === 0) {
    const resetQuestionMessage = Templates.resetQuestions(patientPhone);
    responses.push(resetQuestionMessage);
  }
  switch (step) {
    // case STEPS.SELECT_SPECIALTY:
    //   responses.push(Templates.generateSpecialitiesList(patientPhone));
    //   break;
    case STEPS.INSERT_DATE:
      responses.push(Templates.dateStepTemplateMessage(patientPhone));
      break;
    case STEPS.SELECT_PAYMENT:
      responses.push(Templates.generatePaymentOptions(patientPhone));
      break;
    default:
      return responses;
  }
  return responses;
};
