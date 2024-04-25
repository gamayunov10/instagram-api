import { Controller } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { MessagePattern } from '@nestjs/microservices';

import {
  DELETE_ALL_FILES,
  DELETE_FILE,
  UPLOAD_FILE,
} from '../../../../../../libs/services/constants/service.constants';
import { UploadFileRequest } from '../../../../../../libs/services/user/upload-file-request';
import { UploadFileResponse } from '../../../../../../libs/services/user/upload-file-response';
import { FileRepository } from '../infrastructure/file.repo';
import { DeleteFileRequest } from '../../../../../../libs/services/user/delete-file-request';

import { UploadFileCommand } from './applications/use-cases/upload-file.use-case';
import { DeleteUserPhotoCommand } from './applications/use-cases/delete-file.use-case';

@Controller('files')
export class FilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly fileRepository: FileRepository,
  ) {}

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
