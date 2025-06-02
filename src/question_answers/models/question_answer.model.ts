import { ApiProperty } from "@nestjs/swagger";
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	HasMany,
	Model,
	Table,
} from "sequelize-typescript";
import { QuestionLogic } from "../../question_logics/models/question_logic.model";
import { Question } from "../../questions/models/question.model";

interface IQuestionAnswerCreationDto {
	question_id: number;
	answer_uz: string;
	answer_ru: string;
}

@Table({ tableName: "question_answers", freezeTableName: true })
export class QuestionAnswer extends Model<
	QuestionAnswer,
	IQuestionAnswerCreationDto
> {
	@ApiProperty({
		example: 1,
		description: "Question answer's unique id number",
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
		example: "Ha",
		description: "Answer in Uzbek",
	})
	@Column({ type: DataType.TEXT })
	declare answer_uz: string;

	@ApiProperty({
		example: "Да",
		description: "Answer in Russian",
	})
	@Column({ type: DataType.TEXT })
	declare answer_ru: string;
	@ApiProperty({
		example: 2,
		description: "Option count",
	})
	@Column({ type: DataType.SMALLINT })
	declare count_option: number;
	@ApiProperty({
		example: 10,
		description: "Option Column",
	})
	@Column({ type: DataType.SMALLINT })
	declare col_option: number;
	@BelongsTo(() => Question)
	question: Question;
	@HasMany(() => QuestionLogic)
	questionLogic: QuestionLogic[];
}
