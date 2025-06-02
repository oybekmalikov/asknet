import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { SurveyStatistics } from "./models/survey_statistic.model";
import { SurveyStatisticsController } from "./survey_statistics.controller";
import { SurveyStatisticsService } from "./survey_statistics.service";

@Module({
	imports: [SequelizeModule.forFeature([SurveyStatistics])],
	controllers: [SurveyStatisticsController],
	providers: [SurveyStatisticsService],
})
export class SurveyStatisticsModule {}
