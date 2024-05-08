import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

import { PostInputModel } from '../../../models/input/post.input.model';
import { PostsRepository } from '../../../infrastructure/posts.repo';
import { ResultCode } from '../../../../../base/enums/result-code.enum';
import {
  imagesField,
  invalidImagesIds,
  noneField,
  postNotSaved,
  userIdField,
  userNotFound,
} from '../../../../../base/constants/constants';
import { UsersQueryRepository } from '../../../../user/infrastructure/users.query.repo';
import { isValidUUID } from '../../../../../base/utils/validations/uuid.validator';
import { NodeEnv } from '../../../../../base/enums/node-env.enum';

export class CreatePostCommand {
  constructor(
    public postInputModel: PostInputModel,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  private readonly logger = new Logger(CreatePostUseCase.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly postsRepo: PostsRepository,
    private readonly usersQueryRepository: UsersQueryRepository,
  ) {}

  async execute({ postInputModel, userId }: CreatePostCommand) {
    const user = await this.usersQueryRepository.findUserById(userId);

    if (!user) {
      return {
        data: false,
        code: ResultCode.Unauthorized,
        field: userIdField,
        message: userNotFound,
      };
    }

    let validImageIds = 0;
    let imagesIds = [];
    try {
      imagesIds = postInputModel.images.map(async (image) => {
        if (isValidUUID(image)) {
          validImageIds++;
          imagesIds.push(image);
        }
      });
    } catch (e) {
      if (this.configService.get('ENV') === NodeEnv.DEVELOPMENT) {
        this.logger.error(e);
      }
    }

    if (validImageIds === 0) {
      return {
        data: false,
        code: ResultCode.BadRequest,
        field: imagesField,
        message: invalidImagesIds,
      };
    }

    const post = await this.postsRepo.createPost(postInputModel, userId);

    if (!post) {
      return {
        data: false,
        code: ResultCode.InternalServerError,
        field: noneField,
        message: postNotSaved,
      };
    }
    return {
      data: true,
      code: ResultCode.Success,
      res: post,
    };
  }
}
