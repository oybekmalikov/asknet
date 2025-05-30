import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRegionDto {
	@ApiProperty({
		example: "Toshkent",
		description: "Name in Uzbek",
	})
	@IsString({ message: "name_uz type must be string" })
	@IsNotEmpty({ message: "name_uz must be entered" })
	name_uz: string;

	@ApiProperty({
		example: "Ташкент",
		description: "Name in Russian",
	})
	@IsString({ message: "name_ru type must be string" })
	@IsNotEmpty({ message: "name_ru must be entered" })
	name_ru: string;
}
