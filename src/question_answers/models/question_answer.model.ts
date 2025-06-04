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

interface IQuestionAnswerCreationDto {
	question_id: number;
	answer_title_uz: string;
	answer_title_ru: string;
	answer_uz: string;
	answer_ru: string;
	count_option: string;
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
		example: "👨 Erkak",
		description: "Answer title in Uzbek",
	})
	@Column({ type: DataType.TEXT })
	declare answer_title_uz: string;

	@ApiProperty({
		example: "Да",
		description: "Answer title in Russian",
	})
	@Column({ type: DataType.TEXT })
	declare answer_title_ru: string;
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
	@Column({ type: DataType.ENUM("1", "2") })
	declare count_option: string;
	@BelongsTo(() => Question)
	question: Question;
}
