import { ApiProperty } from "@nestjs/swagger";
import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import { District } from "../../district/models/district.model";

interface IRegionCreationDto {
	name_uz: string;
	name_ru: string;
}

@Table({ tableName: "region", freezeTableName: true })
export class Region extends Model<Region, IRegionCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Region's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: "Toshkent",
		description: "Name in Uzbek",
	})
	@Column({ type: DataType.STRING(100) })
	declare name_uz: string;

	@ApiProperty({
		example: "Ташкент",
		description: "Name in Russian",
	})
	@Column({ type: DataType.STRING(100) })
	declare name_ru: string;
	@HasMany(() => District)
	district: District[];
}
