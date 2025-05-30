import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ClientsModule } from "../clients/clients.module";
import { AuthClientsController } from "./auth_clients.controller";
import { AuthClientsService } from "./auth_clients.service";

@Module({
	imports: [ClientsModule, JwtModule.register({ global: true })],
	controllers: [AuthClientsController],
	providers: [AuthClientsService],
})
export class AuthClientsModule {}
