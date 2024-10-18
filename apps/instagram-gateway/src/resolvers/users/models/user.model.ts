import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { AccountType } from '../../../../../../libs/common/base/ts/enums/account-type.enum';

registerEnumType(AccountType, { name: 'AccountType' });

@ObjectType()
export class UserModel {
  @Field()
  id: string;

  @Field(() => AccountType)
  accountType;

  @Field(() => Date, { nullable: true })
  endDateOfSubscription: Date;

  @Field()
  autoRenewal: boolean;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field(() => Date)
  createdAt: Date;

  @Field({ nullable: true })
  firstName: string;

  @Field({ nullable: true })
  lastName: string;

  @Field({ nullable: true })
  birthDate: string;

  @Field({ nullable: true })
  city: string;

  @Field({ nullable: true })
  country: string;

  @Field({ nullable: true })
  aboutMe: string;

  @Field({ nullable: true })
  avatarURL: string;

  @Field({ nullable: true })
  profileLink: string;

  @Field()
  isDeleted: boolean;
}
