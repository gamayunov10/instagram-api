import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PostModel {
  @Field()
  id: string;

  @Field({ nullable: true })
  description: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isDeleted: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Field()
  authorId: string;
}
