import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInputGql {
  @Field(() => Int, { defaultValue: 1 })
  page: number;

  @Field(() => Int, { defaultValue: 8 })
  pageSize: number;
}
