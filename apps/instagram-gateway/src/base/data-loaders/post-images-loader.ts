import DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { NestDataLoader } from 'nestjs-dataloader';

import { FileModel } from '../../resolvers/posts/models/file-model';
import { FileServiceAdapter } from '../application/adapters/file-service.adapter';
import { PostsService } from '../../features/posts/api/application/posts.service';

@Injectable()
export class PostImagesLoader
  implements NestDataLoader<string, FileModel[] | null>
{
  constructor(
    private readonly fileServiceAdapter: FileServiceAdapter,
    private readonly postService: PostsService,
  ) {}

  generateDataLoader(): DataLoader<string, FileModel[] | null> {
    const batchLoadFn: DataLoader.BatchLoadFn<
      string,
      FileModel[] | null
    > = async (postIds: string[]) => {
      // Шаг 1: Получаем идентификаторы изображений (imageId) для каждого postId
      const postImages = await this.postService.getImageIdsByPostIds(postIds);

      // Создаем маппинг postId -> imageIds
      const postImagesMap = new Map<string, string[]>();
      postImages.forEach((postImage) => {
        const images = postImagesMap.get(postImage.postId) || [];
        images.push(postImage.imageId);
        postImagesMap.set(postImage.postId, images);
      });

      // Шаг 2: Получаем все файлы по imageId
      const allImageIds = Array.from(postImagesMap.values()).flat();
      const filesData = await this.fileServiceAdapter.getFilesMeta(allImageIds);

      if (!filesData.data) {
        return postIds.map(() => null); // Если данные не получены, возвращаем null
      }

      // Шаг 3: Создаем маппинг imageId -> FileModel
      const fileMap = new Map<string, FileModel>();
      filesData.res.forEach((file) => {
        fileMap.set(file.imageId, file); // Используем imageId как ключ
      });

      // Шаг 4: Формируем ответ - массив файлов для каждого postId
      return postIds.map((postId) => {
        const imageIds = postImagesMap.get(postId) || [];
        const filesForPost = imageIds
          .map((imageId) => fileMap.get(imageId)) // Маппим imageId в FileModel
          .filter(Boolean); // Отфильтровываем null значений

        return filesForPost.length ? filesForPost : null; // Если есть файлы, возвращаем их, иначе null
      });
    };
    return new DataLoader(batchLoadFn); // Возвращаем DataLoader с batchLoadFn
  }
}
