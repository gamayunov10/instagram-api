import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';

export interface IFile {
  _id?: string;
  userId: string;
  fileType: FileType;
  originalName: string;
  format: string;
  url: string;
  fileId: string;
  ownerId?: string;
  expirationDate?: Date;
}
