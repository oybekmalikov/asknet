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
import { Response } from "../../bot/models/responses.model";
import { SurveyStatus } from "../../bot/models/survey_status.model";
import { QuestionAnswer } from "../../question_answers/models/question_answer.model";
import { QuestionLogic } from "../../question_logics/models/question_logic.model";
import { Survey } from "../../surveys/models/survey.model";

interface IQuestionCreationAttr {
	survey_id: number;
	field_type: string;
	input_method: string;
	parent_question_id: number;
	title_uz: string;
	title_ru: string;
	description_uz: string;
	description_ru: string;
	image?: string;
}

@Table({ tableName: "questions", freezeTableName: true })
export class Question extends Model<Question, IQuestionCreationAttr> {
	@ApiProperty({
		example: 1,
		description: "Question's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Survey's ID",
	})
	@ForeignKey(() => Survey)
	@Column({ type: DataType.INTEGER })
	declare survey_id: number;

	@ApiProperty({
		example: "text",
		description: "Field type",
	})
	@Column({
		type: DataType.ENUM("text", "radio", "checkbox","region","district"),
	})
	declare field_type: string;

	@ApiProperty({
		example: "single",
		description: "Input method",
	})
	@Column({
		type: DataType.ENUM("single", "multiple", "text", "number"),
	})
	declare input_method: string;

	@ApiProperty({
		example: 1,
		description: "Parent question ID",
	})
	@Column({ type: DataType.INTEGER })
	declare parent_question_id: number;

	@ApiProperty({
		example: "Question in Uzbek",
		description: "Title in Uzbek",
	})
	@Column({ type: DataType.STRING(255) })
	declare title_uz: string;

	@ApiProperty({
		example: "Вопрос на русском",
		description: "Title in Russian",
	})
	@Column({ type: DataType.STRING(255) })
	declare title_ru: string;

	@ApiProperty({
		example: "Description in Uzbek",
		description: "Description in Uzbek",
	})
	@Column({ type: DataType.TEXT })
	declare description_uz: string;

	@ApiProperty({
		example: "Описание на русском",
		description: "Description in Russian",
	})
	@Column({ type: DataType.TEXT })

	declare description_ru: string;
	@ApiProperty({
		example: "is_married",
		description: "Question's key pharase",
	})
	@Column({ type: DataType.STRING(255) })
	declare key_phrase: string;
	@ApiProperty({
		example: "question_image.jpg",
		description: "Image",
	})
	@Column({ type: DataType.STRING(255) })
	declare image: string;
	@BelongsTo(() => Survey)
	survey: Survey;
	@HasMany(() => Response)
	response: Response[];
	@HasMany(() => SurveyStatus)
	survey_status: SurveyStatus[];
	@HasMany(() => QuestionAnswer)
	question_answers: QuestionAnswer[];
	@HasMany(() => QuestionLogic)
	question_logics: QuestionLogic[];
}
