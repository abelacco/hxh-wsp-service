import { BadRequestException, InternalServerErrorException } from "@nestjs/common";
import { EndpointResponse } from "../models/endpoint-response";

export const errorHandler = (code: number, content: EndpointResponse) => {
    const codeDict = {
        400: () => { throw new BadRequestException(content) },
        1100: () => { throw new BadRequestException('Entity already exists') }
    }

    if(codeDict.hasOwnProperty(code)) {
        codeDict[code]();
    } else {
        throw new InternalServerErrorException(content)
    }
}