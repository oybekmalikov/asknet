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
import { CreateQuestionLogicDto } from "./dto/create-question_logic.dto";
import { UpdateQuestionLogicDto } from "./dto/update-question_logic.dto";
import { QuestionLogic } from "./models/question_logic.model";
import { QuestionLogicsService } from "./question_logics.service";

@Controller("question-logics")
export class QuestionLogicsController {
	constructor(private readonly questionLogicsService: QuestionLogicsService) {}

	@ApiOperation({ summary: "Add Question Logic" })
	@ApiResponse({
		status: 201,
		description: "Create Question Logic",
		type: QuestionLogic,
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_logics"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createQuestionLogicDto: CreateQuestionLogicDto) {
		return this.questionLogicsService.create(createQuestionLogicDto);
	}

	@ApiOperation({ summary: "Get All Question Logics" })
	@ApiResponse({
		status: 200,
		description: "List of Question Logics",
		type: [QuestionLogic],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_logics"))
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.questionLogicsService.findAll();
	}

	@ApiOperation({ summary: "Get One Question Logic By Id" })
	@ApiResponse({
		status: 200,
		description: "Question Logic's info",
		type: QuestionLogic,
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_logics"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.questionLogicsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Question Logic By Id" })
	@ApiResponse({
		status: 200,
		description: "Question Logic's updated info",
		type: [QuestionLogic],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "question_logics"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateQuestionLogicDto: UpdateQuestionLogicDto
	) {
		return this.questionLogicsService.update(+id, updateQuestionLogicDto);
	}

	@ApiOperation({ summary: "Delete One Question Logic By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "question_logics"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.questionLogicsService.remove(+id);
	}
}
