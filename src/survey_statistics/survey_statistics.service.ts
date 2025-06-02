import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateSurveyStatisticsDto } from "./dto/create-survey_statistic.dto";
import { UpdateSurveyStatisticDto } from "./dto/update-survey_statistic.dto";
import { SurveyStatistics } from "./models/survey_statistic.model";

@Injectable()
export class SurveyStatisticsService {
	constructor(
		@InjectModel(SurveyStatistics)
		private readonly surveyStatisticsModel: typeof SurveyStatistics
	) {}
	// create(createSurveyStatisticDto: CreateSurveyStatisticsDto) {
	// 	return this.surveyStatisticsModel.create(createSurveyStatisticDto);
	// }

	async findAll() {
		const surevyStatistics = await this.surveyStatisticsModel.findAll({
			include: { all: true },
		});
		if (!surevyStatistics.length) {
			return { message: "Survey statistics not found" };
		} else {
			return surevyStatistics;
		}
	}

	async findOne(id: number) {
		const surveyStatistics = await this.surveyStatisticsModel.findByPk(id, {
			include: { all: true },
		});
		if (!surveyStatistics) {
			throw new NotFoundException(`No survey statistics found with id: ${id}`);
		} else {
			return surveyStatistics;
		}
	}

	// async update(id: number, updateSurveyStatisticDto: UpdateSurveyStatisticDto) {
	// 	const surveyStatistics = await this.surveyStatisticsModel.findByPk(id, {
	// 		include: { all: true },
	// 	});
	// 	if (!surveyStatistics) {
	// 		throw new NotFoundException(`No survey statistics found with id: ${id}`);
	// 	} else {
	// 		return this.surveyStatisticsModel.update(updateSurveyStatisticDto, {
	// 			where: { id },
	// 			returning: true,
	// 		});
	// 	}
	// }

	// async remove(id: number) {
	// 	const surveyStatistics = await this.surveyStatisticsModel.findByPk(id, {
	// 		include: { all: true },
	// 	});
	// 	if (!surveyStatistics) {
	// 		throw new NotFoundException(`No survey statistics found with id: ${id}`);
	// 	} else {
	// 		await this.surveyStatisticsModel.destroy({ where: { id } });
	// 		return { message: "Survey statistics deleted" };
	// 	}
	// }
}
