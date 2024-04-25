import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { FileEntity } from '../entity/file.entity';

@Injectable()
export class FileRepository {
  constructor(
    @InjectModel(File.name) private readonly fileModel: Model<File>,
  ) {}

  async createFile(file: FileEntity) {
    const newFile = new this.fileModel(file);
    return newFile.save();
  }

  async deleteFile(_id: Types.ObjectId) {
    return this.fileModel.deleteOne({ _id });
  }

  async deleteAllFiles(): Promise<boolean> {
    await this.fileModel.deleteMany({});
    return (await this.fileModel.countDocuments()) === 0;
  }
}
