import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsDateString,
	IsEnum,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsString,
} from "class-validator";

export class CreateSurveyDto {
	@ApiProperty({
		example: 1,
		description: "Client's ID",
	})
	@IsInt({ message: "client_id must be an integer" })
	client_id: number;

	@ApiProperty({
		example: "Customer Feedback Survey",
		description: "Title in Uzbek",
	})
	@IsString({ message: "title_uz type must be string" })
	@IsNotEmpty({ message: "title_uz must be entered" })
	title_uz: string;

	@ApiProperty({
		example: "Mijozlar fikri so'rovi",
		description: "Title in Russian",
	})
	@IsString({ message: "title_ru type must be string" })
	@IsNotEmpty({ message: "title_ru must be entered" })
	title_ru: string;

	@ApiProperty({
		example: "Survey description in Uzbek",
		description: "Description in Uzbek",
	})
	@IsString({ message: "description_uz type must be string" })
	description_uz: string;

	@ApiProperty({
		example: "Описание опроса на русском",
		description: "Description in Russian",
	})
	@IsString({ message: "description_ru type must be string" })
	description_ru: string;
	@ApiProperty({
		example: "students",
		description: "school/univercity/job(or company)/pensioner",
	})
	@IsString({ message: "occupation type must be string" })
	forWho: string;
	@ApiProperty({
		example: 1,
		description: "Region's ID",
	})
	@IsInt({ message: "region_id must be an integer" })
	region_id: number;

	@ApiProperty({
		example: 1,
		description: "District's ID",
	})
	@IsInt({ message: "district_id must be an integer" })
	district_id: number;

	@ApiProperty({
		example: "41.2995,69.2401",
		description: "Location coordinates (latitude, longitude)",
	})
	@IsString({ message: "location type must be string" })
	location: string;

	@ApiProperty({
		example: 500,
		description: "Radius in meters",
	})
	@IsInt({ message: "radius must be an integer" })
	radius: number;

	@ApiProperty({
		example: 100000,
		description: "Total budget for the survey",
	})
	@IsNumber({}, { message: "total_budget must be a number" })
	total_budget: number;

	@ApiProperty({
		example: 1000,
		description: "Reward per participant",
	})
	@IsNumber({}, { message: "reward_per_participant must be a number" })
	reward_per_participant: number;

	@ApiProperty({
		example: 100,
		description: "Maximum number of participants",
	})
	@IsInt({ message: "max_participants must be an integer" })
	max_participants: number;

	@ApiProperty({
		example: 18,
		description: "Start age for participants",
	})
	@IsInt({ message: "start_age must be an integer" })
	start_age: number;

	@ApiProperty({
		example: 65,
		description: "Finish age for participants",
	})
	@IsInt({ message: "finish_age must be an integer" })
	finish_age: number;

	@ApiProperty({
		example: "2025-05-01",
		description: "Start date",
	})
	@IsDateString({}, { message: "Invalid date format for start_date" })
	start_date: Date;

	@ApiProperty({
		example: "2025-05-31",
		description: "Finish date",
	})
	@IsDateString({}, { message: "Invalid date format for finish_date" })
	finish_date: Date;

	@ApiProperty({
		example: "draft",
		description: "Status of the survey",
		enum: ["draft", "active", "completed"],
	})
	@IsEnum(["draft", "active", "completed"], {
		message: "status must be 'draft', 'active', or 'completed'",
	})
	status: string;

	@ApiProperty({
		example: true,
		description: "Is the survey anonymous?",
	})
	@IsBoolean({ message: "is_anonymus must be boolean" })
	is_anonymus: boolean;

	@ApiProperty({
		example: true,
		description: "Is the survey visible?",
	})
	@IsBoolean({ message: "is_visible must be boolean" })
	is_visible: boolean;

	@ApiProperty({
		example: 1,
		description: "Survey type's ID",
	})
	@IsInt({ message: "survey_type_id must be an integer" })
	survey_type_id: number;
}
