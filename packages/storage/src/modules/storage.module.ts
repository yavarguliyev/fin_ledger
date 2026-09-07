import { BadRequestException, DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisModule } from '@common/redis';
import { ClientIds, STORAGE_OPTIONS, StorageStrategy } from '@common/shared-libs';

import { BaseStrategy } from './strategies/base/base.strategy';
import { S3StorageStrategy } from './strategies/s3-storage.strategy';
import { StorageService } from './services/storage.service';
import { UploadFileUseCase } from './use-cases/commands/upload-file.use-case';
import { GetFileUrlUseCase } from './use-cases/queries/get-file-url.use-case';
import { DeleteFileUseCase } from './use-cases/commands/delete-file.use-case';
import { StorageModuleOptions } from './interfaces/storage.interface';

@Module({})
export class StorageModule {
  static forRoot (clientId?: ClientIds): DynamicModule {
    return {
      module: StorageModule,
      imports: [RedisModule.forRoot(clientId)],
      providers: [
        {
          provide: STORAGE_OPTIONS,
          useFactory: (configService: ConfigService): StorageModuleOptions => {
            const strategy = configService.get<string>('STORAGE_STRATEGY');
            if (!strategy) throw new BadRequestException('STORAGE_STRATEGY environment variable is required');

            return {
              strategy: strategy as StorageStrategy,
              ...(clientId && { clientId }),
              s3: {
                endpoint: configService.get<string>('STORAGE_ENDPOINT'),
                publicEndpoint: configService.get<string>('STORAGE_PUBLIC_ENDPOINT'),
                accessKeyId: configService.getOrThrow<string>('STORAGE_ACCESS_KEY'),
                secretAccessKey: configService.getOrThrow<string>('STORAGE_SECRET_KEY'),
                region: configService.getOrThrow<string>('STORAGE_REGION'),
                bucketName: configService.getOrThrow<string>('STORAGE_BUCKET_NAME'),
                forcePathStyle: configService.get<boolean>('STORAGE_FORCE_PATH_STYLE') ?? false,
                ensureBucket: configService.get<boolean>('STORAGE_ENSURE_BUCKET') ?? true
              }
            };
          },
          inject: [ConfigService]
        },
        {
          provide: BaseStrategy,
          useFactory: (opts: StorageModuleOptions): BaseStrategy => {
            if (opts.strategy === 's3') return new S3StorageStrategy(opts);
            throw new BadRequestException(`Storage strategy ${opts.strategy} is not implemented`);
          },
          inject: [STORAGE_OPTIONS]
        },
        UploadFileUseCase,
        GetFileUrlUseCase,
        DeleteFileUseCase,
        StorageService
      ],
      exports: [BaseStrategy, StorageService]
    };
  }
}
