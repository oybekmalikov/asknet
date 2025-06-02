import { ApiProperty } from "@nestjs/swagger";
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from "sequelize-typescript";
import { Question } from "../../questions/models/question.model";
import { User } from "./users.model";

interface IResponseCreationDto {
	participant_id: number;
	question_id: number;
	response: string;
	response_time?: string;
}

@Table({ tableName: "responses", freezeTableName: true })
export class Response extends Model<Response, IResponseCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Response's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Participant's ID",
	})
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	declare participant_id: number;

	@ApiProperty({
		example: 1,
		description: "Question's ID",
	})
	@ForeignKey(() => Question)
	@Column({ type: DataType.INTEGER })
	declare question_id: number;

	@ApiProperty({
		example: "Yes",
		description: "Response",
	})
	@Column({ type: DataType.STRING(255) })
	declare response: string;

	@ApiProperty({
		example: "2025-05-30T17:58:00Z",
		description: "Response time",
	})
	@Column({ type: DataType.DATE, defaultValue: DataType.NOW() })
	declare response_time: Date;
	@BelongsTo(() => User)
	participant: User;
	@BelongsTo(() => Question)
	querstion: Question;
}
