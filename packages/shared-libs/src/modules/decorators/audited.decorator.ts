import { SetMetadata } from '@nestjs/common';

import { AuditMetadataDto } from '../dtos/audit/audit-metadata.dto';
import { AUDITED_METADATA } from '../tokens/base.token';

export const Audited = (metadata: AuditMetadataDto): MethodDecorator => SetMetadata(AUDITED_METADATA, metadata);
