import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { LoggerModule } from "../common/logger/logger.module";
import { AdminsController } from "./admins.controller";
import { AdminsService } from "./admins.service";
import { Admin } from "./models/admin.models";

@Module({
	imports: [SequelizeModule.forFeature([Admin]), LoggerModule],
	controllers: [AdminsController],
	providers: [AdminsService],
	exports: [AdminsService],
})
export class AdminsModule {}
