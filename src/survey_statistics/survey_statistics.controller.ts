import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { accessMatrix } from "../app.constants";
import { AccessControlGuard } from "../common/Guards/access-control.guard";
import { AuthGuard } from "../common/Guards/auth.guard";
import { SurveyStatistics } from "./models/survey_statistic.model";
import { SurveyStatisticsService } from "./survey_statistics.service";

@Controller("survey-statistics")
export class SurveyStatisticsController {
	constructor(
		private readonly surveyStatisticsService: SurveyStatisticsService
	) {}

	@ApiOperation({ summary: "Get All Survey Statistics" })
	@ApiResponse({
		status: 200,
		description: "List of Survey Statistics",
		type: [SurveyStatistics],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "survey_statistics"))
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.surveyStatisticsService.findAll();
	}

	@ApiOperation({ summary: "Get One Survey Statistic By Id" })
	@ApiResponse({
		status: 200,
		description: "Survey Statistic's info",
		type: SurveyStatistics,
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "survey_statistics"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.surveyStatisticsService.findOne(+id);
	}
}
