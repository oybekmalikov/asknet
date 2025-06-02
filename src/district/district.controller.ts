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
import { DistrictService } from "./district.service";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";
import { District } from "./models/district.model";

@Controller("districts")
export class DistrictController {
	constructor(private readonly districtsService: DistrictService) {}

	@ApiOperation({ summary: "Add District" })
	@ApiResponse({ status: 201, description: "Create District", type: District })
	@UseGuards(new AccessControlGuard(accessMatrix, "districts"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createDistrictDto: CreateDistrictDto) {
		return this.districtsService.create(createDistrictDto);
	}

	@ApiOperation({ summary: "Get All Districts" })
	@ApiResponse({
		status: 200,
		description: "List of Districts",
		type: [District],
	})
	@Get()
	findAll() {
		return this.districtsService.findAll();
	}

	@ApiOperation({ summary: "Get One District By Id" })
	@ApiResponse({ status: 200, description: "District's info", type: District })
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.districtsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update District By Id" })
	@ApiResponse({
		status: 200,
		description: "District's updated info",
		type: [District],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "districts"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(
		@Param("id") id: string,
		@Body() updateDistrictDto: UpdateDistrictDto
	) {
		return this.districtsService.update(+id, updateDistrictDto);
	}

	@ApiOperation({ summary: "Delete One District By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "districts"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.districtsService.remove(+id);
	}
}
