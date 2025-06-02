import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { FilesService } from "../files/files.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { Question } from "./models/question.model";

@Injectable()
export class QuestionsService {
	constructor(
		@InjectModel(Question) private readonly questionModel: typeof Question,
		private readonly fileService: FilesService
	) {}
	async create(createQuestionDto: CreateQuestionDto, image: any) {
		const fileName = await this.fileService.saveFile(image);
		return this.questionModel.create({
			...createQuestionDto,
			image: fileName,
			survey_id: Number(createQuestionDto.survey_id),
			parent_question_id: Number(createQuestionDto.parent_question_id),
		});
	}

	async findAll() {
		const questions = await this.questionModel.findAll({
			include: { all: true },
		});
		if (!questions.length) {
			return { message: "Questions not found" };
		} else {
			return questions;
		}
	}

	async findOne(id: number) {
		const question = await this.questionModel.findByPk(id, {
			include: { all: true },
		});
		if (!question) {
			throw new NotFoundException(`No question found with id: ${id}`);
		} else {
			return question;
		}
	}

	async update(id: number, updateQuestionDto: UpdateQuestionDto) {
		const question = await this.questionModel.findByPk(id, {
			include: { all: true },
		});
		if (!question) {
			throw new NotFoundException(`No question found with id: ${id}`);
		} else {
			return this.questionModel.update(updateQuestionDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const question = await this.questionModel.findByPk(id, {
			include: { all: true },
		});
		if (!question) {
			throw new NotFoundException(`No question found with id: ${id}`);
		} else {
			await this.questionModel.destroy({ where: { id } });
			return { message: "Question deleted" };
		}
	}
}
