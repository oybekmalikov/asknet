import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { accessMatrix } from "../app.constants";
import { AccessControlGuard } from "../common/guards/access-control.guard";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";
import { Question } from "./models/question.model";
import { QuestionsService } from "./questions.service";
import { FileInterceptor } from '@nestjs/platform-express'

@Controller("questions")
export class QuestionsController {
	constructor(private readonly questionsService: QuestionsService) {}

	@ApiOperation({ summary: "Add Question" })
	@ApiResponse({ status: 201, description: "Create Question", type: Question })
	@UseGuards(new AccessControlGuard(accessMatrix, "questions"))
	@UseGuards(AuthGuard)
	@Post()
	@UseInterceptors(FileInterceptor("image"))
	create(
		@Body() createQuestionDto: CreateQuestionDto,
		@UploadedFile() image: any
	) {
		console.log(createQuestionDto,image)
		return this.questionsService.create(createQuestionDto, image);
	}

	@ApiOperation({ summary: "Get All Questions" })
	@ApiResponse({
		status: 200,
		description: "List of Questions",
		type: [Question],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "questions"))
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.questionsService.findAll();
	}

	@ApiOperation({ summary: "Get One Question By Id" })
	@ApiResponse({ status: 200, description: "Question's info", type: Question })
	@UseGuards(new AccessControlGuard(accessMatrix, "questions"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.questionsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Question By Id" })
	@ApiResponse({
		status: 200,
		description: "Question's updated info",
		type: [Question],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "questions"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateQuestionDto: UpdateQuestionDto
	) {
		return this.questionsService.update(+id, updateQuestionDto);
	}

	@ApiOperation({ summary: "Delete One Question By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "questions"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.questionsService.remove(+id);
	}
}
