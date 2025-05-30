import { ApiProperty } from "@nestjs/swagger";
import { IsEmail } from "class-validator";

export class ClientSignInDto {
	@ApiProperty({
		example: "client@example.com",
		description: "Client's unique email",
	})
	@IsEmail({}, { message: "Invalid email" })
	email: string;
	@ApiProperty({
		example: "**********",
		description: "Client's strong password",
	})
	password: string;
}
