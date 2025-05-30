import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSurveyTypeDto {
	@ApiProperty({
		example: "Feedback",
		description: "Name of the survey type",
	})
	@IsString({ message: "name type must be string" })
	@IsNotEmpty({ message: "name must be entered" })
	name: string;

	@ApiProperty({
		example: "Customer feedback survey",
		description: "Description",
	})
	@IsString({ message: "description type must be string" })
	@IsNotEmpty({ message: "description must be entered" })
	description: string;
}
