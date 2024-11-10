import { Field, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsIn, IsString, Max, Min } from 'class-validator';

import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';

@InputType()
export class PaginationInputUsers {
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Min(1, { message: 'Page size must be greater than or equal to 1' })
  @Max(8, { message: 'Page size must be less than or equal to 8' })
  @Field(() => Int, { defaultValue: 8 })
  pageSize: number = 8;

  @IsString()
  @IsIn(['username', 'email', 'createdAt'], {
    message:
      'sortBy must be one of the following values: username, email, createdAt',
  })
  @Field(() => String, { defaultValue: 'createdAt' })
  sortBy: string = 'createdAt';

  @IsEnum(SortDirection, {
    message: 'sortOrder must be either ASC or DESC',
  })
  @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
  sortOrder: SortDirection = SortDirection.ASC;
}
