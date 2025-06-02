import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { TelegrafModule } from "nestjs-telegraf";
import { AdminsModule } from "./admins/admins.module";
import { Admin } from "./admins/models/admin.models";
import { BOT_NAME } from "./app.constants";
import { AuthAdminsModule } from "./auth_admins/auth_admins.module";
import { AuthClientsModule } from "./auth_clients/auth_clients.module";
import { BotModule } from "./bot/bot.module";
import { Referral } from "./bot/models/refferals.model";
import { Response } from "./bot/models/responses.model";
import { SurveyStatus } from "./bot/models/survey_status.model";
import { User } from "./bot/models/users.model";
import { ClientsModule } from "./clients/clients.module";
import { Client } from "./clients/models/client.model";
import { DistrictModule } from "./district/district.module";
import { FilesModule } from "./files/files.module";
import { MailModule } from "./mail/mail.module";
import { QuestionAnswer } from "./question_answers/models/question_answer.model";
import { QuestionAnswersModule } from "./question_answers/question_answers.module";
import { QuestionLogic } from "./question_logics/models/question_logic.model";
import { QuestionLogicsModule } from "./question_logics/question_logics.module";
import { Question } from "./questions/models/question.model";
import { QuestionsModule } from "./questions/questions.module";
import { RegionModule } from "./region/region.module";
import { SurveyStatistics } from "./survey_statistics/models/survey_statistic.model";
import { SurveyStatisticsModule } from "./survey_statistics/survey_statistics.module";
import { SurveyType } from "./survey_type/models/survey_type.model";
import { SurveyTypeModule } from "./survey_type/survey_type.module";
import { Survey } from "./surveys/models/survey.model";
import { SurveysModule } from "./surveys/surveys.module";

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
		TelegrafModule.forRootAsync({
			botName: BOT_NAME,
			useFactory: () => ({
				token: process.env.BOT_TOKEN!,
				middlewares: [],
				include: [BotModule],
			}),
		}),
		SequelizeModule.forRoot({
			dialect: "postgres",
			port: Number(process.env.PG_PORT),
			host: process.env.PG_HOST,
			username: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DB,
			models: [
				Admin,
				Client,
				Survey,
				SurveyType,
				SurveyStatus,
				SurveyStatistics,
				Question,
				User,
				Response,
				QuestionAnswer,
				QuestionLogic,
				Referral,
			],
			autoLoadModels: true,
			sync: { alter: true },
			logging: false,
		}),
		AdminsModule,
		AuthAdminsModule,
		MailModule,
		ClientsModule,
		AuthClientsModule,
		SurveyTypeModule,
		RegionModule,
		DistrictModule,
		SurveysModule,
		SurveyStatisticsModule,
		QuestionsModule,
		QuestionAnswersModule,
		QuestionLogicsModule,
		BotModule,
		FilesModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
