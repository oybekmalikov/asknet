import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { CreateSurveyTypeDto } from "./dto/create-survey_type.dto";
import { UpdateSurveyTypeDto } from "./dto/update-survey_type.dto";
import { SurveyType } from "./models/survey_type.model";
import { SurveyTypeService } from "./survey_type.service";

@Controller("survey-types")
export class SurveyTypeController {
	constructor(private readonly surveyTypesService: SurveyTypeService) {}

	@ApiOperation({ summary: "Add Survey Type" })
	@ApiResponse({
		status: 201,
		description: "Create Survey Type",
		type: SurveyType,
	})
	@Post()
	create(@Body() createSurveyTypeDto: CreateSurveyTypeDto) {
		return this.surveyTypesService.create(createSurveyTypeDto);
	}

	@ApiOperation({ summary: "Get All Survey Types" })
	@ApiResponse({
		status: 200,
		description: "List of Survey Types",
		type: [SurveyType],
	})
	@Get()
	findAll() {
		return this.surveyTypesService.findAll();
	}

	@ApiOperation({ summary: "Get One Survey Type By Id" })
	@ApiResponse({
		status: 200,
		description: "Survey Type's info",
		type: SurveyType,
	})
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.surveyTypesService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Survey Type By Id" })
	@ApiResponse({
		status: 200,
		description: "Survey Type's updated info",
		type: [SurveyType],
	})
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateSurveyTypeDto: UpdateSurveyTypeDto
	) {
		return this.surveyTypesService.update(+id, updateSurveyTypeDto);
	}

	@ApiOperation({ summary: "Delete One Survey Type By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.surveyTypesService.remove(+id);
	}
}
