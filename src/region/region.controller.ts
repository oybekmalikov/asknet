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
import { AccessControlGuard } from "../common/Guards/access-control.guard";
import { AuthGuard } from "../common/Guards/auth.guard";
import { CreateRegionDto } from "./dto/create-region.dto";
import { UpdateRegionDto } from "./dto/update-region.dto";
import { Region } from "./models/region.model";
import { RegionService } from "./region.service";

@Controller("regions")
export class RegionController {
	constructor(private readonly regionsService: RegionService) {}

	@ApiOperation({ summary: "Add Region" })
	@ApiResponse({ status: 201, description: "Create Region", type: Region })
	@UseGuards(new AccessControlGuard(accessMatrix, "regions"))
	@UseGuards(AuthGuard)
	@Post()
	create(@Body() createRegionDto: CreateRegionDto) {
		return this.regionsService.create(createRegionDto);
	}

	@ApiOperation({ summary: "Get All Regions" })
	@ApiResponse({ status: 200, description: "List of Regions", type: [Region] })
	@Get()
	findAll() {
		return this.regionsService.findAll();
	}

	@ApiOperation({ summary: "Get One Region By Id" })
	@ApiResponse({ status: 200, description: "Region's info", type: Region })
	@Get(":id")
	findOne(@Param("id") id: string) {
		return this.regionsService.findOne(+id);
	}

	@ApiOperation({ summary: "Update Region By Id" })
	@ApiResponse({
		status: 200,
		description: "Region's updated info",
		type: [Region],
	})
	@UseGuards(new AccessControlGuard(accessMatrix, "regions"))
	@UseGuards(AuthGuard)
	@Patch(":id")
	update(@Param("id") id: string, @Body() updateRegionDto: UpdateRegionDto) {
		return this.regionsService.update(+id, updateRegionDto);
	}

	@ApiOperation({ summary: "Delete One Region By Id" })
	@ApiResponse({ status: 200, description: "Return Effected", type: Number })
	@UseGuards(new AccessControlGuard(accessMatrix, "regions"))
	@UseGuards(AuthGuard)
	@Delete(":id")
	remove(@Param("id") id: string) {
		return this.regionsService.remove(+id);
	}
}
