import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { QuestionLogic } from "./models/question_logic.model";
import { QuestionLogicsController } from "./question_logics.controller";
import { QuestionLogicsService } from "./question_logics.service";

@Module({
	imports: [SequelizeModule.forFeature([QuestionLogic])],
	controllers: [QuestionLogicsController],
	providers: [QuestionLogicsService],
})
export class QuestionLogicsModule {}
