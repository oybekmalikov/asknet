import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { AdminsModule } from "../admins/admins.module";
import { AuthAdminsController } from "./auth_admins.controller";
import { AuthAdminsService } from "./auth_admins.service";

@Module({
	imports: [AdminsModule, JwtModule.register({ global: true })],
	controllers: [AuthAdminsController],
	providers: [AuthAdminsService],
})
export class AuthAdminsModule {}
