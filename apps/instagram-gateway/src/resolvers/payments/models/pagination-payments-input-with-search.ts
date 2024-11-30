import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, MaxLength } from 'class-validator';

import { maxChar30 } from '../../../base/constants/constants';

import { PaginationInputPayments } from './pagination-payments-input';

@InputType()
export class PaginationInputPaymentsWithSearch extends PaginationInputPayments {
  @MaxLength(30, { message: maxChar30 })
  @IsOptional()
  @Field(() => String, { nullable: true })
  search?: string;
}
