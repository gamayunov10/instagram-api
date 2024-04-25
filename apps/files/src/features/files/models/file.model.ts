import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { FileType } from '../../../../../../libs/services/ts/enums/file-type.enum';
import { IFile } from '../../../base/ts/interfaces/file.interface';

@Schema()
export class File extends Document implements IFile {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true, enum: FileType, type: String })
  fileType: FileType;

  @Prop({ required: true })
  originalName: string;

  @Prop({ required: true })
  format: string;

  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  fileId: string;

  @Prop({ required: false })
  ownerId: string;

  @Prop({ required: false })
  expirationDate: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
