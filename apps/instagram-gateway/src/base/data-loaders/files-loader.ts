import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { FileModel } from '../../resolvers/posts/models/file-model';
import { FileServiceAdapter } from '../application/adapters/file-service.adapter';

@Injectable()
export class FilesLoader implements NestDataLoader<string, FileModel | null> {
  constructor(private readonly fileServiceAdapter: FileServiceAdapter) {}

  generateDataLoader(): DataLoader<string, FileModel | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      FileModel | null
    > = async (
      fileIds: string[], // Массив идентификаторов файлов, которые нужно загрузить
    ): Promise<(FileModel | null)[]> => {
      // Шаг 1: Запрашиваем все метаданные файлов по переданным fileIds
      const filesData = await this.fileServiceAdapter.getFilesMeta(fileIds);

      // Шаг 2: Проверяем, что данные получены
      if (!filesData.data) {
        // Если данных нет, возвращаем null для каждого id в fileIds
        return fileIds.map(() => null);
      }

      // Шаг 3: Создаем Map для быстрого поиска файлов по их imageId
      const fileMap = new Map<string, FileModel>();
      filesData.res.forEach((file) => {
        fileMap.set(file.imageId, file); // Сохраняем файл по его imageId
      });

      // Шаг 4: Возвращаем массив, где для каждого fileId возвращаем соответствующий файл или null
      return fileIds.map((id) => fileMap.get(id) || null);
    };

    // Возвращаем новый DataLoader с batchLoadFn
    return new DataLoader(batchLoadFn);
  }
}
