import { PartialType } from '@nestjs/mapped-types';
import { CreatePostModel } from './create-post.model';

export class UpdatePostModel extends PartialType(CreatePostModel) {}
