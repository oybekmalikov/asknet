import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CreateDistrictDto {
	@ApiProperty({
		example: 1,
		description: "Region's ID",
	})
	@IsInt({ message: "region_id must be an integer" })
	region_id: number;

	@ApiProperty({
		example: "Yunusobad",
		description: "Name in Uzbek",
	})
	@IsString({ message: "name_uz type must be string" })
	@IsNotEmpty({ message: "name_uz must be entered" })
	name_uz: string;

	@ApiProperty({
		example: "Юнусабад",
		description: "Name in Russian",
	})
	@IsString({ message: "name_ru type must be string" })
	@IsNotEmpty({ message: "name_ru must be entered" })
	name_ru: string;
}
