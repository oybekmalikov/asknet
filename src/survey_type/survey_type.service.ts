import { Injectable } from '@nestjs/common';
import { CreateSurveyTypeDto } from './dto/create-survey_type.dto';
import { UpdateSurveyTypeDto } from './dto/update-survey_type.dto';

@Injectable()
export class SurveyTypeService {
  create(createSurveyTypeDto: CreateSurveyTypeDto) {
    return 'This action adds a new surveyType';
  }

  findAll() {
    return `This action returns all surveyType`;
  }

  findOne(id: number) {
    return `This action returns a #${id} surveyType`;
  }

  update(id: number, updateSurveyTypeDto: UpdateSurveyTypeDto) {
    return `This action updates a #${id} surveyType`;
  }

  remove(id: number) {
    return `This action removes a #${id} surveyType`;
  }
}
