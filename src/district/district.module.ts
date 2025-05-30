import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { DistrictController } from "./district.controller";
import { DistrictService } from "./district.service";
import { District } from "./models/district.model";

@Module({
	imports: [SequelizeModule.forFeature([District])],
	controllers: [DistrictController],
	providers: [DistrictService],
})
export class DistrictModule {}
