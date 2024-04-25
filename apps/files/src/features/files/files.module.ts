import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CqrsModule } from '@nestjs/cqrs';

import { S3Adapter } from '../../base/application/adapters/s3.adapter';

import { FilesController } from './api/files.controller';
import { FilesService } from './api/files.service';
import { FileSchema } from './models/file.model';
import { FileRepository } from './infrastructure/file.repo';
import { UploadFileUseCase } from './api/applications/use-cases/upload-file.use-case';
import { FileQueryRepository } from './infrastructure/file.query.repo';
import { DeleteUserPhotoUseCases } from './api/applications/use-cases/delete-file.use-case';

const providers = [FilesService, S3Adapter];
const repositories = [FileRepository];
const queryRepositories = [FileQueryRepository];
const useCases = [UploadFileUseCase, DeleteUserPhotoUseCases];

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([{ name: File.name, schema: FileSchema }]),
  ],
  controllers: [FilesController],
  providers: [...providers, ...repositories, ...queryRepositories, ...useCases],
})
export class FilesModule {}
