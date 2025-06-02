import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class CreateQuestionDto {
	@ApiProperty({
		example: 1,
		description: "Survey's ID",
	})
	@IsString({ message: "survey_id must be an integer" })
	survey_id: number;

	@ApiProperty({
		example: "text",
		description: "Field type",
	})
	@IsEnum(["text", "radio", "checkbox"], {
		message: "field_type must be 'text', 'radio', or 'checkbox'",
	})
	field_type: string;

	@ApiProperty({
		example: "single",
		description: "Input method",
	})
	@IsEnum(["single", "multiple", "text", "number"], {
		message: "input_method must be 'single' or 'multiple'",
	})
	input_method: string;

	@ApiProperty({
		example: 1,
		description: "Parent question ID",
	})
	@IsString({ message: "parent_question_id must be an integer" })
	parent_question_id: number;

	@ApiProperty({
		example: "Question in Uzbek",
		description: "Title in Uzbek",
	})
	@IsString({ message: "title_uz type must be string" })
	@IsNotEmpty({ message: "title_uz must be entered" })
	title_uz: string;

	@ApiProperty({
		example: "Вопрос на русском",
		description: "Title in Russian",
	})
	@IsString({ message: "title_ru type must be string" })
	@IsNotEmpty({ message: "title_ru must be entered" })
	title_ru: string;

	@ApiProperty({
		example: "Description in Uzbek",
		description: "Description in Uzbek",
	})
	@IsString({ message: "description_uz type must be string" })
	description_uz: string;

	@ApiProperty({
		example: "Описание на русском",
		description: "Description in Russian",
	})
	@IsString({ message: "description_ru type must be string" })
	description_ru: string;

	// @ApiProperty({
	// 	example: "question_image.jpg",
	// 	description: "Image",
	// })
	// @IsString({ message: "image type must be string" })
	// image: string;
}
