import { Field, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsIn,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

import { SortDirection } from '../../../base/enums/sort/sort.direction.enum';
import { maxChar30 } from '../../../base/constants/constants';

@InputType()
export class PaginationInputPayments {
  @Min(1, { message: 'Page must be greater than or equal to 1' })
  @Field(() => Int, { defaultValue: 1 })
  page: number = 1;

  @Min(1, { message: 'Page size must be greater than or equal to 1' })
  @Max(6, { message: 'Page size must be less than or equal to 6' })
  @Field(() => Int, { defaultValue: 6 })
  pageSize: number = 6;

  @IsString()
  @IsIn(['createdAt', 'amount', 'paymentMethod', 'username', 'dateAdded'], {
    message:
      'sortBy must be one of the following values: createdAt, amount, paymentMethod, username, dateAdded',
  })
  @Field(() => String, { defaultValue: 'createdAt' })
  sortBy: string = 'createdAt';

  @IsEnum(SortDirection, {
    message: 'sortOrder must be either ASC or DESC',
  })
  @Field(() => SortDirection, { defaultValue: SortDirection.ASC })
  sortOrder: SortDirection = SortDirection.ASC;

  @MaxLength(30, { message: maxChar30 })
  @IsOptional()
  @Field(() => String, { nullable: true })
  search?: string;
}
