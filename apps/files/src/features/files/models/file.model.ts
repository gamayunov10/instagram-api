import { Document, Schema as MongooseSchema, Types } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';
import { IFile } from '../../../base/ts/interfaces/file.interface';

@Schema()
export class File extends Document implements IFile {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: false })
  _id?: Types.ObjectId;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: FileType, type: String })
  fileType: FileType;

  @Prop({ required: true })
  originalname: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileId: string;

  @Prop({ required: false })
  ownerId?: string;

  @Prop({ required: false })
  expirationDate?: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
