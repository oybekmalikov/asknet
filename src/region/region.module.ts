import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { Region } from "./models/region.model";
import { RegionController } from "./region.controller";
import { RegionService } from "./region.service";

@Module({
	imports: [SequelizeModule.forFeature([Region])],
	controllers: [RegionController],
	providers: [RegionService],
})
export class RegionModule {}
