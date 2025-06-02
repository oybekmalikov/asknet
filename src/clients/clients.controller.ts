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
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Client } from "./models/client.model";

@Controller("clients")
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@ApiOperation({ summary: "Add Client" })
	@ApiResponse({ status: 201, description: "Create Client", type: Client })
	@UseGuards(
		new AccessControlGuard({ clients: ["superadmin", "admin"] }, "clients")
	)
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createClientDto: CreateClientDto) {
		return this.clientsService.create(createClientDto);
	}

	@ApiOperation({ summary: "Get All Clients" })
	@ApiResponse({ status: 200, description: "List of Clients", type: [Client] })
	@UseGuards(
		new AccessControlGuard({ clients: ["superadmin", "admin"] }, "clients")
	)
	@UseGuards(AuthGuard)
	@Get()
	findAll() {
		return this.clientsService.findAll();
	}

	@ApiOperation({ summary: "Get One Client By Id" })
	@ApiResponse({ status: 200, description: "Client's info", type: Client })
	@UseGuards(
		new AccessControlGuard(accessMatrix, "clients"),
		new SelfGuard("id", "id")
	)
	@UseGuards(AuthGuard)
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.clientsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Client By Id" })
	@ApiResponse({
		status: 200,
		description: "Client's updated info",
		type: [Client],
	})
	@UseGuards(
		new AccessControlGuard({ clients: ["superadmin", "admin"] }, "clients")
	)
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
		return this.clientsService.update(+id, updateClientDto);
	}

	@ApiOperation({ summary: "Delete One Client By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(
		new AccessControlGuard({ clients: ["superadmin", "admin"] }, "clients")
	)
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.clientsService.remove(+id);
	}
	@Get("activate/:link")
	activateUser(@Param("link") link: string) {
		return this.clientsService.activation(link);
	}
}
