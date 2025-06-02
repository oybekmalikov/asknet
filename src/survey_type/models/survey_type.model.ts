import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { Survey } from "../../surveys/models/survey.model";

interface ISurveyTypeCreationDto {
	name: string;
	description: string;
}

@Table({ tableName: "survey_type", freezeTableName: true })
export class SurveyType extends Model<SurveyType, ISurveyTypeCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Survey type's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: "Feedback",
		description: "Name of the survey type",
	})
	@Column({ type: DataType.STRING(100) })
	declare name: string;

	@ApiProperty({
		example: "Customer feedback survey",
		description: "Description",
	})
	@Column({ type: DataType.TEXT })
	declare description: string;
	@HasMany(() => Survey)
	surveys: Survey[];
}
