import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateSurveyTypeDto } from "./dto/create-survey_type.dto";
import { UpdateSurveyTypeDto } from "./dto/update-survey_type.dto";
import { SurveyType } from "./models/survey_type.model";

@Injectable()
export class SurveyTypeService {
	constructor(
		@InjectModel(SurveyType) private readonly surveyTypeModel: typeof SurveyType
	) {}
	create(createSurveyTypeDto: CreateSurveyTypeDto) {
		return this.surveyTypeModel.create(createSurveyTypeDto);
	}

	async findAll() {
		const surveyTypes = await this.surveyTypeModel.findAll({
			include: { all: true },
		});
		if (!surveyTypes.length) {
			return { message: "Survey types not found" };
		} else {
			return surveyTypes;
		}
	}

	async findOne(id: number) {
		const surveyType = await this.surveyTypeModel.findByPk(id, {
			include: { all: true },
		});
		if (!surveyType) {
			throw new NotFoundException(`No survey type found with id: ${id}`);
		} else {
			return surveyType;
		}
	}

	async update(id: number, updateSurveyTypeDto: UpdateSurveyTypeDto) {
		const surveyType = await this.surveyTypeModel.findByPk(id, {
			include: { all: true },
		});
		if (!surveyType) {
			throw new NotFoundException(`No survey type found with id: ${id}`);
		} else {
			return this.surveyTypeModel.update(updateSurveyTypeDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const surveyType = await this.surveyTypeModel.findByPk(id, {
			include: { all: true },
		});
		if (!surveyType) {
			throw new NotFoundException(`No survey type found with id: ${id}`);
		} else {
			await this.surveyTypeModel.destroy({ where: { id } });
			return { message: "Survey type deleted" };
		}
	}
}
