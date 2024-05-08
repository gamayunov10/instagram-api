import { PartialType } from '@nestjs/mapped-types';

import { PostInputModel } from './post.input.model';

export class UpdatePostModel extends PartialType(PostInputModel) {}
