import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';
import { IFile } from '../../../base/ts/interfaces/file.interface';

export class FileEntity implements IFile {
  _id?: string;
  userId: string;
  fileType: FileType;
  originalname: string;
  format: string;
  url: string;
  fileId: string;
  ownerId?: string;
  expirationDate?: Date;

  constructor(file: IFile) {
    this._id = file._id;
    this.userId = file.userId;
    this.fileType = file.fileType;
    this.originalname = file.originalname;
    this.format = file.format;
    this.url = file.url;
    this.fileId = file.fileId;
    this.ownerId = file.ownerId;
    this.expirationDate = file.expirationDate;
  }
}
