import { ApiProperty } from "@nestjs/swagger";
import {
	IsBoolean,
	IsEmail,
	IsNotEmpty,
	IsString,
	IsStrongPassword,
	Matches,
} from "class-validator";

export class CreateAdminDto {
	@ApiProperty({
		example: "John Doe",
		description: "Admin's full name",
	})
	@IsString({ message: "full_name type must be string" })
	@IsNotEmpty({ message: "full_name must entered" })
	full_name: string;
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
	@IsStrongPassword({}, { message: "Password must be strong!" })
	password: string;
	@ApiProperty({
		example: "+998901234567",
		description: "Admin's phone number",
	})
	@Matches(/^\+998[0-9]{9}$/, {
		message: "Invalid phone number",
	})
	phone: string;
	@ApiProperty({
		example: "true/false",
		description: "Admin's is active?",
	})
	@IsBoolean({ message: "Admins activity must be boolean" })
	is_active: boolean;
	@ApiProperty({
		example: "true/false",
		description: "Admin's is creator?",
	})
	@IsBoolean({ message: "Admins creativity must be boolean" })
	is_creator: boolean;
}
