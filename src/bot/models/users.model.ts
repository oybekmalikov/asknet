import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Referral } from "./refferals.model";
import { Response } from "./responses.model";
import { SurveyStatus } from "./survey_status.model";

interface IUserCreationDto {
	first_name?: string;
	last_name?: string;
	username?: string;
	real_full_name?: string;
	phone_number?: string;
	language?: string;
	gender?: string;
	offer_code?: string;
	status?: boolean;
	last_state?: string;
	userId?: string;
}

@Table({ tableName: "users", freezeTableName: true })
export class User extends Model<User, IUserCreationDto> {
	@ApiProperty({
		example: 1,
		description: "User's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 123456,
		description: "User's unique telegram id number",
	})
	@Column({
		type: DataType.STRING,
	})
	declare userId: string;

	@ApiProperty({
		example: "John",
		description: "First name",
	})
	@Column({ type: DataType.STRING(100) })
	declare first_name: string;

	@ApiProperty({
		example: "Doe",
		description: "Last name",
	})
	@Column({ type: DataType.STRING(100) })
	declare last_name: string;

	@ApiProperty({
		example: "johndoe",
		description: "Username",
	})
	@Column({ type: DataType.STRING(100) })
	declare username: string;

	@ApiProperty({
		example: "John Doe",
		description: "Real full name",
	})
	@Column({ type: DataType.STRING(100) })
	declare real_full_name: string;

	@ApiProperty({
		example: "+998901234567",
		description: "Phone number",
	})
	@Column({ type: DataType.STRING(20) })
	declare phone_number: string;

	@ApiProperty({
		example: "uz",
		description: "Language",
	})
	@Column({
		type: DataType.ENUM("uz", "ru"),
	})
	declare language: string;

	@ApiProperty({
		example: "male",
		description: "Gender in uz or ru",
	})
	@Column({
		type: DataType.ENUM("male", "female"),
	})
	declare gender: string;

	@ApiProperty({
		example: "REF123",
		description: "Offer code",
	})
	@Column({ type: DataType.STRING(50) })
	declare offer_code: string;

	@ApiProperty({
		example: true,
		description: "Status",
	})
	@Column({ type: DataType.BOOLEAN })
	declare status: boolean;

	@ApiProperty({
		example: "active",
		description: "Last state",
	})
	@Column({ type: DataType.STRING(50) })
	declare last_state: string;
	@ApiProperty({
		example: "is_writing_to_admin",
		description: "Action",
	})
	@Column({ type: DataType.STRING(50) })
	declare actions: string;
	@HasMany(() => SurveyStatus)
	survey_status: SurveyStatus[];
	@HasMany(() => Response)
	responses: Response[];
	@HasMany(() => Referral)
	referral: Referral[];
}
