import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SurveyType } from "./models/survey_type.model";
import { SurveyTypeController } from "./survey_type.controller";
import { SurveyTypeService } from "./survey_type.service";

@Module({
	imports: [SequelizeModule.forFeature([SurveyType])],
	controllers: [SurveyTypeController],
	providers: [SurveyTypeService],
})
export class SurveyTypeModule {}
