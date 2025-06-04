import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Admin } from "../admins/models/admin.models";
import { District } from "../district/models/district.model";
import { QuestionAnswer } from "../question_answers/models/question_answer.model";
import { QuestionLogic } from "../question_logics/models/question_logic.model";
import { Question } from "../questions/models/question.model";
import { Region } from "../region/models/region.model";
import { Survey } from "../surveys/models/survey.model";
import { AdminService } from "./admins/admin.service";
import { AdminUpdate } from "./admins/admin.update";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { Referral } from "./models/refferals.model";
import { Response } from "./models/responses.model";
import { SurveyStatus } from "./models/survey_status.model";
import { UserSurvey } from "./models/user_surveys.model";
import { User } from "./models/users.model";
import { UserService } from "./users/users.service";
import { UserUpdate } from "./users/users.update";

@Module({
	imports: [
		SequelizeModule.forFeature([
			Referral,
			Response,
			SurveyStatus,
			User,
			Admin,
			Survey,
			Question,
			QuestionAnswer,
			QuestionLogic,
			Region,
			District,
			UserSurvey,
		]),
	],
	controllers: [],
	providers: [
		BotService,
		UserService,
		AdminService,
		AdminUpdate,
		UserUpdate,
		BotUpdate,
	],
})
export class BotModule {}
