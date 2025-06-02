import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateDistrictDto } from "./dto/create-district.dto";
import { UpdateDistrictDto } from "./dto/update-district.dto";
import { District } from "./models/district.model";

@Injectable()
export class DistrictService {
	constructor(
		@InjectModel(District) private readonly districtModel: typeof District
	) {}
	create(createDistrictDto: CreateDistrictDto) {
		return this.districtModel.create(createDistrictDto);
	}

	async findAll() {
		const districts = await this.districtModel.findAll({
			include: { all: true },
		});
		if (!districts.length) {
			return { message: "Districts not found" };
		} else {
			return districts;
		}
	}

	async findOne(id: number) {
		const district = await this.districtModel.findByPk(id, {
			include: { all: true },
		});
		if (!district) {
			throw new NotFoundException(`No district found with id: ${id}`);
		} else {
			return district;
		}
	}

	async update(id: number, updateDistrictDto: UpdateDistrictDto) {
		const district = await this.districtModel.findByPk(id, {
			include: { all: true },
		});
		if (!district) {
			throw new NotFoundException(`No district found with id: ${id}`);
		} else {
			return this.districtModel.update(updateDistrictDto, {
				where: { id },
				returning: true,
			});
		}
	}

	async remove(id: number) {
		const region = await this.districtModel.findByPk(id, {
			include: { all: true },
		});
		if (!region) {
			throw new NotFoundException(`No district found with id: ${id}`);
		} else {
			await this.districtModel.destroy({ where: { id } });
			return { message: "District deleted" };
		}
	}
}
