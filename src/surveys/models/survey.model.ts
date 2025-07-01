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
import { SurveyStatus } from "../../bot/models/survey_status.model";
import { UserSurvey } from "../../bot/models/user_surveys.model";
import { Client } from "../../clients/models/client.model";
import { Question } from "../../questions/models/question.model";
import { SurveyStatistics } from "../../survey_statistics/models/survey_statistic.model";
import { SurveyType } from "../../survey_type/models/survey_type.model";

interface ISurveyCreationAttr {
	client_id: number;
	title_uz: string;
	title_ru: string;
	description_uz: string;
	description_ru: string;
	forWho: string;
	region_id: number;
	district_id: number;
	location: string;
	radius: number;
	total_budget: number;
	reward_per_participant: number;
	max_participants: number;
	start_age: number;
	finish_age: number;
	start_date: Date;
	finish_date: Date;
	status: string;
	is_anonymus: boolean;
	is_visible: boolean;
	survey_type_id: number;
}

@Table({ tableName: "surveys", freezeTableName: true })
export class Survey extends Model<Survey, ISurveyCreationAttr> {
	@ApiProperty({
		example: 1,
		description: "Survey's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Client's ID",
	})
	@ForeignKey(() => Client)
	@Column({ type: DataType.INTEGER })
	declare client_id: number;

	@ApiProperty({
		example: "Customer Feedback Survey",
		description: "Title in Uzbek",
	})
	@Column({ type: DataType.STRING(255) })
	declare title_uz: string;

	@ApiProperty({
		example: "Mijozlar fikri so'rovi",
		description: "Title in Russian",
	})
	@Column({ type: DataType.STRING(255) })
	declare title_ru: string;

	@ApiProperty({
		example: "Survey description in Uzbek",
		description: "Description in Uzbek",
	})
	@Column({ type: DataType.TEXT })
	declare description_uz: string;

	@ApiProperty({
		example: "Описание опроса на русском",
		description: "Description in Russian",
	})
	@Column({ type: DataType.TEXT })
	declare description_ru: string;
	@ApiProperty({
		example: "students",
		description: "school/univercity/job(or company)/pensioner",
	})
	@Column({ type: DataType.STRING(50) })
	declare forWho: string;
	@ApiProperty({
		example: 1,
		description: "Region's ID",
	})
	@Column({ type: DataType.INTEGER })
	declare region_id: number;

	@ApiProperty({
		example: 1,
		description: "District's ID",
	})
	@Column({ type: DataType.INTEGER })
	declare district_id: number;

	@ApiProperty({
		example: "41.2995|69.2401",
		description: "Location coordinates (latitude, longitude)",
	})
	@Column({ type: DataType.STRING(50) })
	declare location: string;

	@ApiProperty({
		example: 500,
		description: "Radius in meters",
	})
	@Column({ type: DataType.INTEGER })
	declare radius: number;

	@ApiProperty({
		example: 100000,
		description: "Total budget for the survey",
	})
	@Column({ type: DataType.DECIMAL(10, 2) })
	declare total_budget: number;

	@ApiProperty({
		example: 1000,
		description: "Reward per participant",
	})
	@Column({ type: DataType.DECIMAL(10, 2) })
	declare reward_per_participant: number;

	@ApiProperty({
		example: 100,
		description: "Maximum number of participants",
	})
	@Column({ type: DataType.INTEGER })
	declare max_participants: number;

	@ApiProperty({
		example: 18,
		description: "Start age for participants",
	})
	@Column({ type: DataType.INTEGER })
	declare start_age: number;

	@ApiProperty({
		example: 65,
		description: "Finish age for participants",
	})
	@Column({ type: DataType.INTEGER })
	declare finish_age: number;

	@ApiProperty({
		example: "2025-05-01",
		description: "Start date",
	})
	@Column({ type: DataType.DATEONLY })
	declare start_date: Date;

	@ApiProperty({
		example: "2025-05-31",
		description: "Finish date",
	})
	@Column({ type: DataType.DATEONLY })
	declare finish_date: Date;

	@ApiProperty({
		example: "draft",
		description: "Status of the survey",
	})
	@Column({
		type: DataType.ENUM("draft", "active", "complated"),
	})
	declare status: string;

	@ApiProperty({
		example: true,
		description: "Is the survey anonymous?",
	})
	@Column({ type: DataType.BOOLEAN })
	declare is_anonymus: boolean;

	@ApiProperty({
		example: true,
		description: "Is the survey visible?",
	})
	@Column({ type: DataType.BOOLEAN })
	declare is_visible: boolean;

	@ApiProperty({
		example: 1,
		description: "Survey type's ID",
	})
	@ForeignKey(() => SurveyType)
	@Column({ type: DataType.INTEGER })
	declare survey_type_id: number;
	@BelongsTo(() => Client)
	client: Client;
	@BelongsTo(() => SurveyType)
	survey_type: SurveyType;
	@HasMany(() => SurveyStatus)
	survey_status: SurveyStatus[];
	@HasMany(() => SurveyStatistics)
	survey_statistics: SurveyStatistics[];
	@HasMany(() => Question)
	question: Question[];
	@HasMany(() => UserSurvey)
	usersurvey: UserSurvey[];
}
