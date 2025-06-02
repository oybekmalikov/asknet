import { ApiProperty } from "@nestjs/swagger";
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from "sequelize-typescript";
import { Survey } from "../../surveys/models/survey.model";

interface ISurveyStatisticsCreationDto {
	survey_id: number;
	total_responses: number;
	completed_responses: number;
}

@Table({ tableName: "survey_statistics", freezeTableName: true })
export class SurveyStatistics extends Model<
	SurveyStatistics,
	ISurveyStatisticsCreationDto
> {
	@ApiProperty({
		example: 1,
		description: "Survey statistic's unique id number",
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
		example: 100,
		description: "Total responses",
	})
	@Column({ type: DataType.INTEGER })
	declare total_responses: number;

	@ApiProperty({
		example: 80,
		description: "Completed responses",
	})
	@Column({ type: DataType.INTEGER })
	declare completed_responses: number;
	@BelongsTo(() => Survey)
	survey: Survey;
}
