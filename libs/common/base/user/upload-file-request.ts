import { FileType } from '../ts/enums/file-type.enum';

export class UploadFileRequest {
  id?: string;
  userId: string;
  originalName: string;
  buffer: Buffer;
  format: string;
  fileType: FileType;
  ownerId?: string;
  expirationDate?: Date;
}
