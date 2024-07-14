import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';

import { UsersQueryRepository } from '../../../infrastructure/users.query.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  pageNumberDefault,
  pageSizeDefault,
  usernameField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UserPublicProfileOutputModel } from '../../../models/output/user.public.profile.output.model';
import { PostsGetCommand } from '../../../../posts/api/application/use-cases/queryBus/posts-get-use.case';
import { PostQueryModel } from '../../../../posts/models/query/post.query.model';
import { SortDirection } from '../../../../../base/enums/sort/sort.direction.enum';
import { PostSortFields } from '../../../../../base/enums/sort/post/post.sort.fields.enum';
import { ExceptionResultType } from '../../../../../base/types/exception.type';
import { FileServiceAdapter } from '../../../../../base/application/adapters/file-service.adapter';

export class ViewUserPublicInfoCommand {
  constructor(public username: string) {}
}

@CommandHandler(ViewUserPublicInfoCommand)
export class ViewUserPublicInfoUseCase
  implements ICommandHandler<ViewUserPublicInfoCommand>
{
  constructor(
    private readonly usersQueryRepository: UsersQueryRepository,
    private readonly queryBus: QueryBus,
    private readonly fileServiceAdapter: FileServiceAdapter,
  ) {}

  async execute(
    command: ViewUserPublicInfoCommand,
  ): Promise<UserPublicProfileOutputModel | ExceptionResultType<boolean>> {
    const user = await this.usersQueryRepository.findUserByUsername(
      command.username,
    );

    if (!user) {
      return {
        data: false,
        code: ResultCode.NotFound,
        field: usernameField,
        message: userNotFound,
      };
    }

    const query: PostQueryModel = {
      sortDirection: SortDirection.DESC,
      sortField: PostSortFields.CREATED_AT,
      page: pageNumberDefault,
      pageSize: pageSizeDefault,
    };

    const posts: ExceptionResultType<boolean> = await this.queryBus.execute(
      new PostsGetCommand(user.id, query),
    );

    const publications =
      posts.code === ResultCode.Success ? posts.response.items : [];

    let avatarUrl = null;

    if (user.avatarId) {
      const avatar = await this.fileServiceAdapter.getFileUrlByFileId(
        user.avatarId,
      );
      avatarUrl = { url: avatar };
    }

    return {
      username: user.username,
      aboutMe: user.aboutMe,
      following: 0,
      followers: 0,
      publicationsCount: publications.length,
      publications: publications,
      avatar: avatarUrl,
    };
  }
}
