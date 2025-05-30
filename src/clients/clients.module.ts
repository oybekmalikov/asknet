import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { ClientsController } from "./clients.controller";
import { ClientsService } from "./clients.service";
import { Client } from "./models/client.model";

@Module({
	imports: [SequelizeModule.forFeature([Client])],
	controllers: [ClientsController],
	providers: [ClientsService],
	exports: [ClientsService],
})
export class ClientsModule {}
