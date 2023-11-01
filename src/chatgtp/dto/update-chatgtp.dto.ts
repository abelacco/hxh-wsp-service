import { PartialType } from '@nestjs/mapped-types';
import { CreateChatgtpDto } from './create-chatgtp.dto';

export class UpdateChatgtpDto extends PartialType(CreateChatgtpDto) {}
