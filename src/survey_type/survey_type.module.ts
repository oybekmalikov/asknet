import { Module } from '@nestjs/common';
import { SurveyTypeService } from './survey_type.service';
import { SurveyTypeController } from './survey_type.controller';

@Module({
  controllers: [SurveyTypeController],
  providers: [SurveyTypeService],
})
export class SurveyTypeModule {}
