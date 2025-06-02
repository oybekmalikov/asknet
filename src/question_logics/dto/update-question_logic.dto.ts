import { PartialType } from '@nestjs/swagger';
import { CreateQuestionLogicDto } from './create-question_logic.dto';

export class UpdateQuestionLogicDto extends PartialType(CreateQuestionLogicDto) {}
