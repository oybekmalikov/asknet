import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IClientCreationDto {
	full_name: string;
	company: string;
	email: string;
	password: string;
	phone_number: string;
	description: string;
}

@Table({ tableName: "clients", freezeTableName: true })
export class Client extends Model<Client, IClientCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Client's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: "Ali Valiyev",
		description: "Full name of the client",
	})
	@Column({ type: DataType.STRING(100) })
	declare full_name: string;

	@ApiProperty({
		example: "client@example.com",
		description: "email",
	})
	@Column({ type: DataType.STRING(100) })
	declare email: string;

	@ApiProperty({
		example: "*******",
		description: "Client Strong password",
	})
	@Column({ type: DataType.STRING(100) })
	declare password: string;

	@ApiProperty({
		example: "TechCorp",
		description: "Company name",
	})
	@Column({ type: DataType.STRING(100) })
	declare company: string;

	@ApiProperty({
		example: "+998901234567",
		description: "Phone number",
	})
	@Column({ type: DataType.STRING(20) })
	declare phone_number: string;

	@ApiProperty({
		example: "Regular client",
		description: "Description",
	})
	@Column({ type: DataType.TEXT })
	declare description: string;
	@ApiProperty({
		example: "true/false",
		description: "Client is active?",
	})
	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	declare is_active: boolean;
	@ApiProperty({
		example: "refresh token",
		description: "refresh token",
	})
	@Column({ type: DataType.STRING })
	declare refresh_token: string;
	@Column({ type: DataType.UUID, defaultValue: DataType.UUIDV4 })
	declare activation_link: string;
}
