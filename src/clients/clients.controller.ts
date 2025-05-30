import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	Patch,
	Post,
} from "@nestjs/common";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ClientsService } from "./clients.service";
import { CreateClientDto } from "./dto/create-client.dto";
import { UpdateClientDto } from "./dto/update-client.dto";
import { Client } from "./models/client.model";

@Controller("clients")
export class ClientsController {
	constructor(private readonly clientsService: ClientsService) {}

	@ApiOperation({ summary: "Add Client" })
	@ApiResponse({ status: 201, description: "Create Client", type: Client })
	@Post()
	create(@Body() createClientDto: CreateClientDto) {
		return this.clientsService.create(createClientDto);
	}

	@ApiOperation({ summary: "Get All Clients" })
	@ApiResponse({ status: 200, description: "List of Clients", type: [Client] })
	@Get()
	findAll() {
		return this.clientsService.findAll();
	}

	@ApiOperation({ summary: "Get One Client By Id" })
	@ApiResponse({ status: 200, description: "Client's info", type: Client })
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
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateClientDto: UpdateClientDto) {
		return this.clientsService.update(+id, updateClientDto);
	}

	@ApiOperation({ summary: "Delete One Client By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.clientsService.remove(+id);
	}
}
