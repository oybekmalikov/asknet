import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateQuestionAnswerDto {
	@ApiProperty({
		example: 1,
		description: "Question's ID",
	})
	@IsInt({ message: "question_id must be an integer" })
	question_id: number;

	@ApiProperty({
		example: "Ha",
		description: "Answer title in Uzbek",
	})
	@IsString({ message: "answer_uz type must be string" })
	@IsNotEmpty({ message: "answer_uz must be entered" })
	answer_title_uz: string;

	@ApiProperty({
		example: "Да",
		description: "Answer title in Russian",
	})
	@IsString({ message: "answer_ru type must be string" })
	@IsNotEmpty({ message: "answer_ru must be entered" })
	answer_title_ru: string;

	@ApiProperty({
		example: "Ha",
		description: "Answer in Uzbek",
	})
	@IsString({ message: "answer_uz type must be string" })
	@IsNotEmpty({ message: "answer_uz must be entered" })
	answer_uz: string;

	@ApiProperty({
		example: "Да",
		description: "Answer in Russian",
	})
	@IsString({ message: "answer_ru type must be string" })
	@IsNotEmpty({ message: "answer_ru must be entered" })
	answer_ru: string;

	@ApiProperty({
		example: "1",
		description: "Column option",
	})
	@IsNumber()
	count_option: string;
}
