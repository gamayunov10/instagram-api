import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import {
  DELETE_ALL_FILES,
  DELETE_FILE,
  GET_FILES_META,
  UPLOAD_FILE,
} from '../../../../../../libs/common/base/constants/service.constants';
import { UploadFileRequest } from '../../../../../../libs/common/base/user/upload-file-request';
import { UploadFileResponse } from '../../../../../../libs/common/base/user/upload-file-response';
import { DeleteFileRequest } from '../../../../../../libs/common/base/user/delete-file-request';
import { FileRepository } from '../infrastructure/file.repo';

import { UploadFileCommand } from './applications/use-cases/upload-file.use-case';
import { DeleteUserPhotoCommand } from './applications/use-cases/delete-file.use-case';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly fileRepository: FileRepository,
    private readonly filesService: FilesService,
  ) {}

  @MessagePattern({ cmd: GET_FILES_META })
  async getFilesInfo({ ids }) {
    return this.filesService.getFilesMeta(ids);
  }

  @MessagePattern({ cmd: UPLOAD_FILE })
  async uploadFile(payload: UploadFileRequest): Promise<UploadFileResponse> {
    return this.commandBus.execute<UploadFileCommand, UploadFileResponse>(
      new UploadFileCommand(payload),
    );
  }

  @MessagePattern({ cmd: DELETE_FILE })
  async deleteFile({ fileId }: DeleteFileRequest) {
    return this.commandBus.execute(new DeleteUserPhotoCommand(fileId));
  }

  @MessagePattern({ cmd: DELETE_ALL_FILES })
  async deleteAllFiles(): Promise<boolean> {
    return this.fileRepository.deleteAllFiles();
  }
}
