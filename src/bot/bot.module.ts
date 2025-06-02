import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Admin } from "../admins/models/admin.models";
import { BotService } from "./bot.service";
import { BotUpdate } from "./bot.update";
import { Referral } from "./models/refferals.model";
import { Response } from "./models/responses.model";
import { SurveyStatus } from "./models/survey_status.model";
import { User } from "./models/users.model";
import { UserService } from "./users/users.service";
import { UserUpdate } from "./users/users.update";

@Module({
	imports: [
		SequelizeModule.forFeature([Referral, Response, SurveyStatus, User, Admin]),
		
	],
	controllers: [],
	providers: [BotService, UserService, UserUpdate, BotUpdate],
})
export class BotModule {}
