import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { QuestionAnswer } from "./models/question_answer.model";
import { QuestionAnswersController } from "./question_answers.controller";
import { QuestionAnswersService } from "./question_answers.service";

@Module({
	imports: [SequelizeModule.forFeature([QuestionAnswer])],
	controllers: [QuestionAnswersController],
	providers: [QuestionAnswersService],
})
export class QuestionAnswersModule {}
