import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateQuestionAnswerDto } from "./dto/create-question_answer.dto";
import { UpdateQuestionAnswerDto } from "./dto/update-question_answer.dto";
import { QuestionAnswer } from "./models/question_answer.model";

@Injectable()
export class QuestionAnswersService {
	constructor(
		@InjectModel(QuestionAnswer)
		private readonly questionAnswerModel: typeof QuestionAnswer
	) {}
	create(createQuestionAnswerDto: CreateQuestionAnswerDto) {
		return this.questionAnswerModel.create(createQuestionAnswerDto);
	}

	async findAll() {
		const questionAnswers = await this.questionAnswerModel.findAll({
			include: { all: true },
		});
		if (!questionAnswers.length) {
			return { message: "Question answers not found" };
		} else {
			return questionAnswers;
		}
	}

	async findOne(id: number) {
		const questionAnswer = await this.questionAnswerModel.findByPk(id, {
			include: { all: true },
		});
		if (!questionAnswer) {
			throw new NotFoundException(`No question answer found with id: ${id}`);
		} else {
			return questionAnswer;
		}
	}

	async update(id: number, updateQuestionAnswerDto: UpdateQuestionAnswerDto) {
		const questionAnswer = await this.questionAnswerModel.findByPk(id, {
			include: { all: true },
		});
		if (!questionAnswer) {
			throw new NotFoundException(`No question answer found with id: ${id}`);
		} else {
			return this.questionAnswerModel.update(updateQuestionAnswerDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const questionAnswer = await this.questionAnswerModel.findByPk(id, {
			include: { all: true },
		});
		if (!questionAnswer) {
			throw new NotFoundException(`No question answer found with id: ${id}`);
		} else {
			await this.questionAnswerModel.destroy({ where: { id } });
			return { message: "Question answer deleted" };
		}
	}
}
