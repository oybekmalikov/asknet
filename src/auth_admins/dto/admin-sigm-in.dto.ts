import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class AdminSignInDto {
	@ApiProperty({
		example: "admin@example.com",
		description: "Admin's unique email",
	})
	@IsEmail({}, { message: "Invalid email" })
	email: string;
	@ApiProperty({
		example: "mySecretPassword",
		description: "Admin's strong password",
	})
	password: string;
}
