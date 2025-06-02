import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
	UseGuards,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { accessMatrix } from "../app.constants";
import { AccessControlGuard } from "../common/guards/access-control.guard";
import { AuthGuard } from "../common/guards/auth.guard";
import { SelfGuard } from "../common/guards/self.guard";
import { AdminsService } from "./admins.service";
import { CreateAdminDto } from "./dto/create-admin.dto";
import { UpdateAdminDto } from "./dto/update-admin.dto";
import { Admin } from "./models/admin.models";

@Controller("admins")
export class AdminsController {
	constructor(private readonly adminsService: AdminsService) {}
	@ApiOperation({ summary: "Add Admin" })
	@ApiResponse({ status: 201, description: "Create Admin", type: Admin })
	@UseGuards(new AccessControlGuard({ admins: ["superadmin"] }, "admins"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createAdminDto: CreateAdminDto) {
		return this.adminsService.create(createAdminDto);
	}
	@ApiOperation({ summary: "Get All Admins" })
	@ApiResponse({ status: 200, description: "List of Admins", type: [Admin] })
	@Get()
	@UseGuards(new AccessControlGuard({ admins: ["superadmin"] }, "admins"))
	@UseGuards(AuthGuard)
	findAll() {
		return this.adminsService.findAll();
	}
	@ApiOperation({ summary: "Get One Admin By Id" })
	@ApiResponse({ status: 200, description: "Admin's info", type: Admin })
	@UseGuards(
		new AccessControlGuard(accessMatrix, "admins"),
		new SelfGuard("id", "id")
	)
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.adminsService.findOne(+id);
	}
	@ApiOperation({ summary: "Update Admin By Id" })
	@ApiResponse({
		status: 200,
		description: "Admin's updated info",
		type: [Admin],
	})
	@UseGuards(
		new AccessControlGuard(accessMatrix, "admins"),
		new SelfGuard("id", "id")
	)
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateAdminDto: UpdateAdminDto) {
		return this.adminsService.update(+id, updateAdminDto);
	}
	@ApiOperation({ summary: "Delete One Admin By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(
		new AccessControlGuard(accessMatrix, "admins"),
		new SelfGuard("id", "id")
	)
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.adminsService.remove(+id);
	}
}
