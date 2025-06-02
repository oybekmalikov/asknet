import { ApiProperty } from "@nestjs/swagger";
import {
	BelongsTo,
	Column,
	DataType,
	ForeignKey,
	Model,
	Table,
} from "sequelize-typescript";
import { User } from "./users.model";

interface IReferralCreationDto {
	referrer_id: number;
	referred_user_id: number;
	bonus_given: boolean;
	referral_code: string;
}

@Table({ tableName: "referrals", freezeTableName: true })
export class Referral extends Model<Referral, IReferralCreationDto> {
	@ApiProperty({
		example: 1,
		description: "Referral's unique id number",
	})
	@Column({
		type: DataType.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	})
	declare id: number;

	@ApiProperty({
		example: 1,
		description: "Referrer's user ID",
	})
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	declare reffer_id: number;

	@ApiProperty({
		example: 1,
		description: "Referred user's ID",
	})
	@ForeignKey(() => User)
	@Column({ type: DataType.INTEGER })
	declare reffered_user_id: number;

	@ApiProperty({
		example: true,
		description: "Bonus given",
	})
	@Column({ type: DataType.BOOLEAN })
	declare bonus_given: boolean;

	@ApiProperty({
		example: "REF2023",
		description: "Referral code",
	})
	@Column({ type: DataType.STRING(50) })
	declare referral_code: string;
	@BelongsTo(() => User)
	reffer: User;
	@BelongsTo(() => User)
	reffered_user: User;
}
