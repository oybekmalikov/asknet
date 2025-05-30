import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SequelizeModule } from "@nestjs/sequelize";
import { AdminsModule } from "./admins/admins.module";
import { Admin } from "./admins/models/admin.models";
import { AuthAdminsModule } from "./auth_admins/auth_admins.module";
import { AuthClientsModule } from "./auth_clients/auth_clients.module";
import { ClientsModule } from "./clients/clients.module";
import { Client } from "./clients/models/client.model";
import { MailModule } from "./mail/mail.module";
import { SurveyTypeModule } from './survey_type/survey_type.module';
import { RegionModule } from './region/region.module';
import { DistrictModule } from './district/district.module';

@Module({
	imports: [
		ConfigModule.forRoot({ envFilePath: ".env", isGlobal: true }),
		SequelizeModule.forRoot({
			dialect: "postgres",
			port: Number(process.env.PG_PORT),
			host: process.env.PG_HOST,
			username: process.env.PG_USER,
			password: process.env.PG_PASSWORD,
			database: process.env.PG_DB,
			models: [Admin, Client],
			autoLoadModels: true,
			sync: { alter: true },
			logging: false,
		}),
		AdminsModule,
		AuthAdminsModule,
		MailModule,
		ClientsModule,
		AuthClientsModule,
		SurveyTypeModule,
		RegionModule,
		DistrictModule,
	],
	controllers: [],
	providers: [],
})
export class AppModule {}
