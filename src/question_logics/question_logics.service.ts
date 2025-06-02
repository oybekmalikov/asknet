import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateQuestionLogicDto } from "./dto/create-question_logic.dto";
import { UpdateQuestionLogicDto } from "./dto/update-question_logic.dto";
import { QuestionLogic } from "./models/question_logic.model";

@Injectable()
export class QuestionLogicsService {
	constructor(
		@InjectModel(QuestionLogic)
		private readonly questionLogicModule: typeof QuestionLogic
	) {}
	create(createQuestionLogicDto: CreateQuestionLogicDto) {
		return this.questionLogicModule.create(createQuestionLogicDto);
	}

	async findAll() {
		const questionLogics = await this.questionLogicModule.findAll({
			include: { all: true },
		});
		if (!questionLogics.length) {
			return { message: "Question logics not found" };
		} else {
			return questionLogics;
		}
	}

	async findOne(id: number) {
		const questionLogic = await this.questionLogicModule.findByPk(id, {
			include: { all: true },
		});
		if (!questionLogic) {
			throw new NotFoundException(`No question logic found with id: ${id}`);
		} else {
			return questionLogic;
		}
	}

	async update(id: number, updateQuestionLogicDto: UpdateQuestionLogicDto) {
		const questionLogic = await this.questionLogicModule.findByPk(id, {
			include: { all: true },
		});
		if (!questionLogic) {
			throw new NotFoundException(`No question logic found with id: ${id}`);
		} else {
			return this.questionLogicModule.update(updateQuestionLogicDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const questionLogic = await this.questionLogicModule.findByPk(id, {
			include: { all: true },
		});
		if (!questionLogic) {
			throw new NotFoundException(`No question logic found with id: ${id}`);
		} else {
			await this.questionLogicModule.destroy({ where: { id } });
			return { message: "Question logic deleted" };
		}
	}
}
