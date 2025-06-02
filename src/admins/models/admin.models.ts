import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, Model, Table } from "sequelize-typescript";

interface IAdminCreationAttr {
	full_name: string;
	email: string;
	password: string;
	phone: string;
	is_active: boolean;
	is_creator: boolean;
}
@Table({ tableName: "admins", freezeTableName: true })
export class Admin extends Model<Admin, IAdminCreationAttr> {
	@ApiProperty({
		example: 1,
		description: "Admin's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;
	@ApiProperty({
		example: "John Doe",
		description: "Admin's full name",
	})
	@Column({ type: DataType.STRING(100) })
	declare full_name: string;
	@ApiProperty({
		example: "admin@example.com",
		description: "Admin's unique email",
	})
	@Column({ type: DataType.STRING(100), unique: true })
	declare email: string;
	@ApiProperty({
		example: "mySecretPassword",
		description: "Admin's strong password",
	})
	@Column({ type: DataType.STRING })
	declare password: string;
	@ApiProperty({
		example: "+998901234567",
		description: "Admin's phone number",
	})
	@Column({ type: DataType.STRING(20) })
	declare phone: string;
	@ApiProperty({
		example: "true/false",
		description: "Admin's is active?",
	})
	@Column({ type: DataType.BOOLEAN, defaultValue: true })
	declare is_active: boolean;
	@ApiProperty({
		example: "true/false",
		description: "Admin's is creator?",
	})
	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	declare is_creator: boolean;
	@ApiProperty({
		example: "...",
		description: "Admin's refresh token",
	})
	@Column({ type: DataType.ENUM("uz", "ru"), defaultValue: "uz" })
	declare language: string;
	@Column({ type: DataType.STRING })
	declare last_state: string;
	@Column({ type: DataType.STRING })
	declare userId: string;
	@Column({ type: DataType.STRING })
	declare refresh_token: string;
}
