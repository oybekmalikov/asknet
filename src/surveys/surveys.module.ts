import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Survey } from "./models/survey.model";
import { SurveysController } from "./surveys.controller";
import { SurveysService } from "./surveys.service";

@Module({
	imports: [SequelizeModule.forFeature([Survey])],
	controllers: [SurveysController],
	providers: [SurveysService],
})
export class SurveysModule {}
