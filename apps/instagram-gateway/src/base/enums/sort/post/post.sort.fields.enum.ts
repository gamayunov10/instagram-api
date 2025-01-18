import { registerEnumType } from '@nestjs/graphql';

export enum PostSortFields {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  AUTHOR_ID = 'authorId',
}

registerEnumType(PostSortFields, {
  name: 'PostSortFields',
});
