import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { FilesModule } from "../files/files.module";
import { Question } from "./models/question.model";
import { QuestionsController } from "./questions.controller";
import { QuestionsService } from "./questions.service";

@Module({
	imports: [SequelizeModule.forFeature([Question]), FilesModule],
	controllers: [QuestionsController],
	providers: [QuestionsService],
})
export class QuestionsModule {}
