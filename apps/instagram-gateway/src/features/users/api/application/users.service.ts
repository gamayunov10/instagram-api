import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { UsersRepository } from '../../infrastructure/users.repo';
import { UsersQueryRepository } from '../../infrastructure/users.query.repo';
import { UserModel } from '../../../../resolvers/users/models/user.model';
import { Paginator } from '../../../../base/pagination/paginator';
import { PaginatedUserModel } from '../../../../resolvers/users/models/paginated-user.model';
import { SortDirection } from '../../../../base/enums/sort/sort.direction.enum';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly usersQueryRepository: UsersQueryRepository,

    private readonly configService: ConfigService,
  ) {}
  async getAllUsers(
    page: number,
    pageSize: number,
    sortBy: string,
    sortOrder: SortDirection,
    search: string,
  ): Promise<PaginatedUserModel> {
    const result = await this.usersQueryRepository.getUsersWithRelations(
      page,
      pageSize,
      sortBy,
      sortOrder,
      search,
    );
    const users = this.mapUsers(result.users);

    return Paginator.paginate({
      pageNumber: page,
      pageSize: pageSize,
      totalCount: result.totalCount,
      items: users,
    });
  }
  private mapUsers(users: any[]): UserModel[] {
    return users.map((user) => {
      return {
        id: user.id,
        username: user.username,
        accountType: user.accountType,
        endDateOfSubscription: user.endDateOfSubscription,
        autoRenewal: user.autoRenewal,
        email: user.email,
        createdAt: user.createdAt,
        firstName: user.firstName,
        lastName: user.lastName,
        birthDate: user.birthDate,
        city: user.city,
        country: user.country,
        aboutMe: user.aboutMe,
        avatarURL: user.avatarURL,
        profileLink: `https://inctagram.org/profile?id=${user.id}`,
      };
    });
  }
}
