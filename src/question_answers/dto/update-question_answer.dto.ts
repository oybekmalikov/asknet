import { PartialType } from '@nestjs/swagger';
import { CreateQuestionAnswerDto } from './create-question_answer.dto';

export class UpdateQuestionAnswerDto extends PartialType(CreateQuestionAnswerDto) {}
