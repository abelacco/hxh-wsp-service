import { Injectable } from '@nestjs/common';
import { CreateWspDto } from './dto/create-wsp.dto';
import { UpdateWspDto } from './dto/update-wsp.dto';
import { Wsp } from './entities/wsp.entity';
import { WspQueriesDto } from './dto/queries-webhook';

@Injectable()
export class WspService {
  addMessage(messageWSP: any) {
    console.log(JSON.stringify(messageWSP));
    return 'This action adds a new wsp';
  }

  validateWebHook(wspQueries: WspQueriesDto) {

    const myVerifyToken = process.env.MY_VERIFY_TOKEN;
    const hubMode = wspQueries['hub.mode'];
    const challenge = wspQueries['hub.challenge'];
    const verifyToken = wspQueries['hub.verify_token'];
    console.log(myVerifyToken);

    if (hubMode === 'subscribe' && verifyToken === myVerifyToken) {
      return challenge;
    } else {
      throw new Error('Failed validation. Make sure the validation tokens match.');
    }
  }


}
