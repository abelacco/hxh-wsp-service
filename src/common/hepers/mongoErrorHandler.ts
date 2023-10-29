import { BadRequestException, InternalServerErrorException } from "@nestjs/common";

export const mongoErrorHandler = (error: any) => {
    if (error.code === 11000) {
      throw new BadRequestException(
        'Doctor ya existe' + JSON.stringify(error.keyValue),
      );
    }
    throw new InternalServerErrorException(
      'Error creando doctor' + JSON.stringify(error),
    );
  }