import { SetMetadata } from '@nestjs/common';

import { RolesDto } from '../dtos/decorator/roles.dto';
import { ROLES_KEY } from '../constants/auth/roles-key.constant';

export const Roles = ({ roles }: RolesDto): ClassDecorator & MethodDecorator => SetMetadata(ROLES_KEY, roles);
