import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from '../repository/likes.repository';

export class GetLikesInfoForPostCommand {
  constructor(public post: any, public sortBy: string) {}
}

@CommandHandler(GetLikesInfoForPostCommand)
export class GetLikesInfoForPostUseCase
  implements ICommandHandler<GetLikesInfoForPostCommand>
{
  constructor(private readonly likesRepository: LikesRepository) {}

  async execute(command: GetLikesInfoForPostCommand) {
    const { post, sortBy } = command;
    const [likes, dislikes, newestLikes] = await Promise.all([
      this.likesRepository.getLikesCountByParentId(post.id),
      this.likesRepository.getDislikesCountByParentId(post.id),
      this.likesRepository.getNewestLikesByPostId(post.id, sortBy),
    ]);
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: likes,
        dislikesCount: dislikes,
        myStatus: 'None',
        newestLikes: newestLikes,
      },
    }
  }
}
