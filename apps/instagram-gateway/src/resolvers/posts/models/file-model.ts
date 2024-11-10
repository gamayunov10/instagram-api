import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { FileType } from '../../../../../../libs/common/base/ts/enums/file-type.enum';

registerEnumType(FileType, {
  name: 'FileType',
});

@ObjectType()
export class FileModel {
  @Field()
  authorId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => FileType)
  fileType: FileType;

  @Field()
  url: string;

  @Field()
  imageId: string;
}
