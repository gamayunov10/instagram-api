import { ObjectId } from 'mongoose';

import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';

export interface IFile {
  _id?: ObjectId;
  userId: string;
  fileType: FileType;
  originalname: string;
  format: string;
  url: string;
  fileId: string;
  ownerId?: string;
  expirationDate?: Date;
}
