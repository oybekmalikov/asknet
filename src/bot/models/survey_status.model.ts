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
import { Survey } from "../../surveys/models/survey.model";
import { User } from "./users.model";

interface ISurveyStatusCreationDto {
	user_id: number;
	survey_id: number;
	status: string;
	progress: object;
	viewed_at: string;
	last_question_id: number;
}

@Table({ tableName: "survey_status", freezeTableName: true })
export class SurveyStatus extends Model<
	SurveyStatus,
	ISurveyStatusCreationDto
> {
	@ApiProperty({
		example: 1,
		description: "Survey status's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "User's ID",
	})
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	declare user_id: number;

	@ApiProperty({
		example: 1,
		description: "Survey's ID",
	})
	@ForeignKey(() => Survey)
	@Column({ type: DataType.INTEGER })
	declare survey_id: number;

	@ApiProperty({
		example: "draft",
		description: "Status of the survey",
	})
	@Column({
		type: DataType.ENUM("in_progress", "completed", "pending"),
	})
	declare status: string;

	@ApiProperty({
		example: '{"currentQuestion": 1, "completed": false}',
		description: "Progress of the survey",
	})
	@Column({ type: DataType.JSON })
	declare progress: object;

	@ApiProperty({
		example: "2025-05-30",
		description: "Last viewed at",
	})
	@Column({ type: DataType.DATE })
	declare viewed_at: Date;

	@ApiProperty({
		example: 2,
		description: "Last question ID",
	})
	@ForeignKey(() => Question)
	@Column({ type: DataType.INTEGER })
	declare last_question_id: number;
	@BelongsTo(() => User)
	user: User;
	@BelongsTo(() => Survey)
	survey: Survey;
	@BelongsTo(() => Question)
	last_question: Question;
}
