// models/user-survey.model.ts
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
import { User } from "./users.model";
interface IUserSurveysCreationAttr {
	userId: number;
	surveyId: number;
	status: boolean;
}

@Table({ tableName: "user_surveys", timestamps: true })
export class UserSurvey extends Model<UserSurvey, IUserSurveysCreationAttr> {
	@ApiProperty({
		example: 1,
		description: "User id",
	})
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	userId: number;
	@ApiProperty({
		example: 1,
		description: "Survey id",
	})
	@ForeignKey(() => Survey)
	@Column({ type: DataType.INTEGER })
	surveyId: number;
	@ApiProperty({
		example: false,
		description: "Status",
	})
	@Column({ type: DataType.BOOLEAN, defaultValue: false })
	status: boolean;

	@BelongsTo(() => User)
	user: User;

	@BelongsTo(() => Survey)
	survey: Survey;
}
