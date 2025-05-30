import { ApiProperty } from "@nestjs/swagger";
import {
	IsEmail,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
} from "class-validator";

export class CreateClientDto {
	@ApiProperty({
		example: "Ali Valiyev",
		description: "Full name of the client",
	})
	@IsString({ message: "full_name type must be string" })
	@IsNotEmpty({ message: "full_name must be entered" })
	full_name: string;
	@ApiProperty({
		example: "client@example.com",
		description: "Client's email",
	})
	@IsEmail({}, { message: "Invalid email" })
	email: string;
	@ApiProperty({
		example: "********",
		description: "Client's password",
	})
	@IsStrongPassword({}, { message: "Password not strong enough" })
	password: string;
	@ApiProperty({
		example: "TechCorp",
		description: "Company name",
	})
	@IsString({ message: "company type must be string" })
	@IsNotEmpty({ message: "company must be entered" })
	company: string;

	@ApiProperty({
		example: "+998901234567",
		description: "Phone number",
	})
	@IsString({ message: "phone_number type must be string" })
	@IsNotEmpty({ message: "phone_number must be entered" })
	phone_number: string;

	@ApiProperty({
		example: "Regular client",
		description: "Description",
	})
	@IsString({ message: "description type must be string" })
	description: string;
}
