import { UseGuards } from '@nestjs/common';
import {
  Args,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription,
} from '@nestjs/graphql';
import DataLoader from 'dataloader';
import { Loader } from 'nestjs-dataloader';

import { BasicGqlGuard } from '../../infrastructure/guards/basic-gql-guard.service';
import { PostsService } from '../../features/posts/api/application/posts.service';
import { PostImagesLoader } from '../../base/data-loaders/post-images-loader';
import { pubSub } from '../../settings/pubsub.provider';
import { BasicGqlSubscriptionGuard } from '../../infrastructure/guards/basic-gql-subscription.guard';
import { UserModel } from '../users/models/user.model';
import { UserLoader } from '../../base/data-loaders/user-loader';

import { PaginatedPostsImagesModel } from './models/paginated-posts-images.model';
import { PostModel } from './models/post-model';
import { PaginationInputPosts } from './models/pagination-posts-input';
import { PaginatedPostsModel } from './models/paginated-posts.model';
import { FileModel } from './models/file-model';

@Resolver(() => PostModel)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly userLoader: UserLoader,
  ) {}

  @Query(() => PaginatedPostsModel, { nullable: true })
  @UseGuards(BasicGqlGuard)
  async getPosts(
    @Args('paginationPosts', {
      type: () => PaginationInputPosts,
      nullable: true,
    })
    paginationPosts: PaginationInputPosts,
  ): Promise<PaginatedPostsModel> {
    return this.postsService.findPostsByQuery(paginationPosts);
  }

  @ResolveField(() => [FileModel], { nullable: true })
  async imagesData(
    @Parent() post: PostModel,
    @Loader(PostImagesLoader)
    postImagesLoader: DataLoader<string, PostImagesLoader>,
  ) {
    return await postImagesLoader.load(post.id);
  }

  @Query(() => PaginatedPostsImagesModel)
  @UseGuards(BasicGqlGuard)
  async getPostsImagesByUser(
    @Args('userId') userId: string,
    @Args('paginationPosts', {
      type: () => PaginationInputPosts,
      nullable: true,
    })
    paginationPosts: PaginationInputPosts,
  ): Promise<PaginatedPostsImagesModel> {
    return this.postsService.getPostsImagesByUser(userId, paginationPosts);
  }

  @ResolveField(() => UserModel, { nullable: true })
  async user(@Parent() postModel: PostModel) {
    return this.userLoader.generateDataLoader().load(postModel.authorId);
  }

  @Subscription(() => PostModel)
  @UseGuards(BasicGqlSubscriptionGuard)
  postAdded() {
    return pubSub.asyncIterableIterator('postAdded');
  }
}
