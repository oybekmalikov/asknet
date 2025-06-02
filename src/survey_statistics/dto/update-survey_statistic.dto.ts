import { PartialType } from '@nestjs/swagger';
import { CreateSurveyStatisticsDto } from './create-survey_statistic.dto';

export class UpdateSurveyStatisticDto extends PartialType(CreateSurveyStatisticsDto) {}
