import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { accessMatrix } from "../app.constants";
import { AccessControlGuard } from "../common/Guards/access-control.guard";
import { AuthGuard } from "../common/Guards/auth.guard";
import { CreateQuestionAnswerDto } from "./dto/create-question_answer.dto";
import { UpdateQuestionAnswerDto } from "./dto/update-question_answer.dto";
import { QuestionAnswer } from "./models/question_answer.model";
import { QuestionAnswersService } from "./question_answers.service";

@Controller("question-answers")
export class QuestionAnswersController {
	constructor(
		private readonly questionAnswersService: QuestionAnswersService
	) {}

	@ApiOperation({ summary: "Add Question Answer" })
	@ApiResponse({
		status: 201,
		description: "Create Question Answer",
		type: QuestionAnswer,
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_answers"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createQuestionAnswerDto: CreateQuestionAnswerDto) {
		return this.questionAnswersService.create(createQuestionAnswerDto);
	}

	@ApiOperation({ summary: "Get All Question Answers" })
	@ApiResponse({
		status: 200,
		description: "List of Question Answers",
		type: [QuestionAnswer],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_answers"))
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.questionAnswersService.findAll();
	}

	@ApiOperation({ summary: "Get One Question Answer By Id" })
	@ApiResponse({
		status: 200,
		description: "Question Answer's info",
		type: QuestionAnswer,
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_answers"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.questionAnswersService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Question Answer By Id" })
	@ApiResponse({
		status: 200,
		description: "Question Answer's updated info",
		type: [QuestionAnswer],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_answers"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateQuestionAnswerDto: UpdateQuestionAnswerDto
	) {
		return this.questionAnswersService.update(+id, updateQuestionAnswerDto);
	}

	@ApiOperation({ summary: "Delete One Question Answer By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "question_answers"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.questionAnswersService.remove(+id);
	}
}
