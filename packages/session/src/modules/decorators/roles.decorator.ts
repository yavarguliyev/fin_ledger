import { CustomDecorator, SetMetadata } from '@nestjs/common';

import { RolesDto } from '../dtos/decorator/roles.dto';
import { ROLES_KEY } from '../constants/roles-key.constant';
import { IS_PUBLIC_KEY } from '../constants/is-public-key.constant';

export const Roles = ({ roles }: RolesDto): ClassDecorator & MethodDecorator => SetMetadata(ROLES_KEY, roles);
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
