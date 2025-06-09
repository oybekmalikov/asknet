import {
	Body,
	Controller,
	Delete,
	ForbiddenException,
	Get,
	Param,
	Patch,
	Post,
	Req,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { Request } from "express";
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
	findAll(@Req() req: Request) {
		const user = (req as any).user;
		if (
			user.roles.includes("admin") ||
			user.roles.includes("superadmin") 
		) {
			return this.surveysService.findAll();
		} else if (user.roles.includes("client")) {
			return this.surveysService.findByClientId(user.id);
		}
		throw new ForbiddenException("Access denied");
	}

	@ApiOperation({ summary: "Get One Survey By Id" })
	@ApiResponse({ status: 200, description: "Survey's info", type: Survey })
	@UseGuards(new AccessControlGuard(accessMatrix, "surveys"))
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string, @Req() req: Request) {
		const user = (req as any).user;
		if (
			user.roles.includes("admin") ||
			user.roles.includes("superadmin") 
		) {
			return this.surveysService.findOne(+id);
		} else if (user.roles.includes("client")) {
			return this.surveysService.findOneByClientId(+id, user.id);
		}
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
