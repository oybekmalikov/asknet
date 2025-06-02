import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty } from "class-validator";


export class CreateQuestionLogicDto {
	@ApiProperty({
		example: 1,
		description: "Question's ID",
	})
	@IsInt({ message: "question_id must be an integer" })
	@IsNotEmpty({ message: "question_id must be entered" })
	question_id: number;

	@ApiProperty({
		example: 1,
		description: "Option's ID",
	})
	@IsInt({ message: "option_id must be an integer" })
	@IsNotEmpty({ message: "option_id must be entered" })
	option_id: number;

	@ApiProperty({
		example: "active",
		description: "Status of the logic",
	})
	@IsEnum(
		[
			"skip_to",
			"end_survey",
			"start_survey",
			"show_question",
			"hide_question",
			"disable",
		],
		{ message: "status wrong enum type" }
	)
	@IsNotEmpty({ message: "status must be entered" })
	status: string;

	@ApiProperty({
		example: 2,
		description: "Next question's ID",
	})
	@IsInt({ message: "next_question_id must be an integer" })
	@IsNotEmpty({ message: "next_question_id must be entered" })
	next_question_id: number;
}
