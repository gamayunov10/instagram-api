import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { FileModel } from '../../resolvers/posts/models/file-model';
import { FileServiceAdapter } from '../application/adapters/file-service.adapter';

@Injectable()
export class UserImagesLoader
  implements NestDataLoader<string, FileModel[] | null>
{
  constructor(private readonly fileServiceAdapter: FileServiceAdapter) {}

  generateDataLoader(): DataLoader<string, FileModel[] | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      FileModel[] | null
    > = async (
      userIds: string[], // Получаем массив userIds для пакетной загрузки
    ): Promise<(FileModel[] | null)[]> => {
      // Запрашиваем все файлы для переданных userIds
      const filesData =
        await this.fileServiceAdapter.getFilesMetaByUserIds(userIds);

      // Если данные не получены, возвращаем null для каждого userId
      if (!filesData.data) {
        return userIds.map(() => null);
      }

      // Создаем Map, где ключ - это userId, а значение - массив файлов для этого userId
      const filesMap = new Map<string, FileModel[]>();
      filesData.res.forEach((file) => {
        const userIdFiles = filesMap.get(file.authorId) || [];
        userIdFiles.push(file);
        filesMap.set(file.authorId, userIdFiles);
      });

      // Для каждого userId возвращаем соответствующие файлы или null, если их нет
      return userIds.map((userId) => filesMap.get(userId) || null);
    };

    // Создаем и возвращаем новый DataLoader с batchLoadFn
    return new DataLoader(batchLoadFn);
  }
}
