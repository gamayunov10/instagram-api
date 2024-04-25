import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { UploadFileRequest } from '../../../../../../libs/services/user/upload-file-request';
import {
  DELETE_ALL_FILES,
  DELETE_FILE,
  UPLOAD_FILE,
} from '../../../../../../libs/services/constants/service.constants';
import { ResultCode } from '../../enums/result-code.enum';
import { fileField } from '../../constants/constants';
import { UploadFileResponse } from '../../../../../../libs/services/user/upload-file-response';
import { NodeEnv } from '../../enums/node-env.enum';

@Injectable()
export class FileServiceAdapter {
  logger = new Logger(FileServiceAdapter.name);

  constructor(
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async upload(payload: UploadFileRequest) {
    try {
      const serviceResponse = this.fileServiceClient
        .send({ cmd: UPLOAD_FILE }, payload)
        .pipe(timeout(10000));

      const result: UploadFileResponse = await firstValueFrom(serviceResponse);

      return {
        data: true,
        code: ResultCode.Success,
        res: result.fileId,
      };
    } catch (e) {
      this.logger.error(e);
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'File not loaded',
      };
    }
  }

  async deleteUserPhoto(fileId: string) {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: DELETE_FILE }, { fileId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);

      return {
        data: true,
        code: ResultCode.Success,
        res: result,
      };
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }

      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'Upload error',
      };
    }
  }

  async deleteAllFiles() {
    try {
      const serviceResponse = this.fileServiceClient
        .send({ cmd: DELETE_ALL_FILES }, '')
        .pipe(timeout(10000));

      await firstValueFrom(serviceResponse);

      return {
        data: true,
        code: ResultCode.Success,
      };
    } catch (e) {
      this.logger.error(e);
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: fileField,
        message: 'File not loaded',
      };
    }
  }
}
