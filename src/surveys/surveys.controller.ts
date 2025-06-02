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
import { AccessControlGuard } from "../common/guards/access-control.guard";
import { AuthGuard } from "../common/guards/auth.guard";
import { CreateSurveyDto } from "./dto/create-survey.dto";
import { UpdateSurveyDto } from "./dto/update-survey.dto";
import { Survey } from "./models/survey.model";
import { SurveysService } from "./surveys.service";

@Controller("surveys")
export class SurveysController {
	constructor(private readonly surveysService: SurveysService) {}

	@ApiOperation({ summary: "Add Survey" })
	@ApiResponse({ status: 201, description: "Create Survey", type: Survey })
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createSurveyDto: CreateSurveyDto) {
		return this.surveysService.create(createSurveyDto);
	}

	@ApiOperation({ summary: "Get All Surveys" })
	@ApiResponse({ status: 200, description: "List of Surveys", type: [Survey] })
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.surveysService.findAll();
	}

	@ApiOperation({ summary: "Get One Survey By Id" })
	@ApiResponse({ status: 200, description: "Survey's info", type: Survey })
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.surveysService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Survey By Id" })
	@ApiResponse({
		status: 200,
		description: "Survey's updated info",
		type: [Survey],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateSurveyDto: UpdateSurveyDto) {
		return this.surveysService.update(+id, updateSurveyDto);
	}

	@ApiOperation({ summary: "Delete One Survey By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.surveysService.remove(+id);
	}
}
