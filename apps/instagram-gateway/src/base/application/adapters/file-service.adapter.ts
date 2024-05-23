import { Inject, Injectable, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout } from 'rxjs';
import { ConfigService } from '@nestjs/config';

import { UploadFileRequest } from '../../../../../../libs/common/base/user/upload-file-request';
import { UploadFileResponse } from '../../../../../../libs/common/base/user/upload-file-response';
import { ResultCode } from '../../enums/result-code.enum';
import { fileField, noneField } from '../../constants/constants';
import { NodeEnv } from '../../enums/node-env.enum';
import {
  DELETE_ALL_FILES,
  DELETE_FILE,
  GET_FILE_URL,
  GET_FILES_META,
  UPLOAD_FILE,
} from '../../../../../../libs/common/base/constants/service.constants';

@Injectable()
export class FileServiceAdapter {
  logger = new Logger(FileServiceAdapter.name);

  constructor(
    @Inject('FILE_SERVICE') private readonly fileServiceClient: ClientProxy,
    private readonly configService: ConfigService,
  ) {}

  async getFilesMeta(ids: string[]) {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_FILES_META }, { ids })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);

      return {
        data: true,
        code: ResultCode.Success,
        res: result,
      };
    } catch (e) {
      this.logger.error(e);
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: 'error: 2454',
      };
    }
  }

  async getFileUrlByFileId(fileId: string) {
    try {
      const responseOfService = this.fileServiceClient
        .send({ cmd: GET_FILE_URL }, { fileId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(responseOfService);

      return result.url;
    } catch (e) {
      this.logger.error(e);
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: 'error: 2455',
      };
    }
  }

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

  async deleteFile(fileId: string) {
    try {
      const response = this.fileServiceClient
        .send({ cmd: DELETE_FILE }, { fileId })
        .pipe(timeout(10000));

      const result = await firstValueFrom(response);

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
        field: noneField,
        message: 'Delete error',
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
        field: noneField,
        message: 'Delete error',
      };
    }
  }
}
