import { Injectable } from '@nestjs/common';
import { CreatePostModel } from './models/input/create-post.model';
import { UpdatePostModel } from './models/input/update-post.model';

@Injectable()
export class PostService {
  create(createPostModel: CreatePostModel) {
    return 'This action adds a new post';
  }

  findAll() {
    return `This action returns all post`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  update(id: number, updatePostModel: UpdatePostModel) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
