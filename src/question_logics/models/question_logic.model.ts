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

interface IQuestionLogicCreationDto {
	question_id: number;
	option_id: number;
	status: string;
	next_question_id: number;
}

@Table({ tableName: "question_logics", freezeTableName: true })
export class QuestionLogic extends Model<
	QuestionLogic,
	IQuestionLogicCreationDto
> {
	@ApiProperty({
		example: 1,
		description: "Question logic's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Question's ID",
	})
	@ForeignKey(() => Question)
	@Column({ type: DataType.INTEGER })
	declare question_id: number;

	@ApiProperty({
		example: 1,
		description: "Option's ID",
	})
	@Column({ type: DataType.INTEGER })
	declare option_id: number;

	@ApiProperty({
		example: "start_survey",
		description: "Status of the logic",
	})
	@Column({
		type: DataType.ENUM(
			"skip_to",
			"start_survey",
			"end_survey",
			"show_question",
			"hide_question",
			"disable"
		),
	})
	declare status: string;

	@ApiProperty({
		example: 2,
		description: "Next question's ID",
	})
	@ForeignKey(() => Question)
	@Column({ type: DataType.INTEGER })
	declare next_question_id: number;
	@BelongsTo(() => Question)
	question: Question;
	@BelongsTo(() => Question)
	next_question: Question;
}
