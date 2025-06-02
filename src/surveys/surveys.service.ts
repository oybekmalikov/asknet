import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { Survey } from "./models/survey.model";

@Injectable()
export class SurveysService {
	constructor(
		@InjectModel(Survey) private readonly surveyModel: typeof Survey
	) {}
	create(createSurveyDto: CreateSurveyDto) {
		return this.surveyModel.create(createSurveyDto);
	}

	async findAll() {
		const surveys = await this.surveyModel.findAll({
			include: { all: true },
		});
		if (!surveys.length) {
			return { message: "Surveys not found" };
		} else {
			return surveys;
		}
	}

	async findOne(id: number) {
		const survey = await this.surveyModel.findByPk(id, {
			include: { all: true },
		});
		if (!survey) {
			throw new NotFoundException(`No survey found with id: ${id}`);
		} else {
			return survey;
		}
	}

	async update(id: number, updateSurveyDto: UpdateSurveyDto) {
		const survey = await this.surveyModel.findByPk(id, {
			include: { all: true },
		});
		if (!survey) {
			throw new NotFoundException(`No survey found with id: ${id}`);
		} else {
			return this.surveyModel.update(updateSurveyDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const survey = await this.surveyModel.findByPk(id, {
			include: { all: true },
		});
		if (!survey) {
			throw new NotFoundException(`No survey found with id: ${id}`);
		} else {
			await this.surveyModel.destroy({ where: { id } });
			return { message: "Survey deleted" };
		}
	}
}
