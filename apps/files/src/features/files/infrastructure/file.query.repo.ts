import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { File } from '../models/file.model';

@Injectable()
export class FileQueryRepository {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async findFileById(id: Types.ObjectId) {
    return this.fileModel.findById(id);
  }
}
