import { SetMetadata } from "@nestjs/common";
import { ROLES_KEY } from "../../app.constants";
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
