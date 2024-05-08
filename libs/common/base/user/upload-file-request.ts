import { FileType } from '../ts/enums/file-type.enum';

export class UploadFileRequest {
  id?: string;
  userId: string;
  originalname: string;
  buffer: Buffer;
  format: string;
  fileType: FileType;
  ownerId?: string;
  expirationDate?: Date;
}
