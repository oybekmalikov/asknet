import { PartialType } from '@nestjs/swagger';
import { CreateSurveyTypeDto } from './create-survey_type.dto';

export class UpdateSurveyTypeDto extends PartialType(CreateSurveyTypeDto) {}
