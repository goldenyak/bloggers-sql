import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from '../repository/likes.repository';

export class GetLikesInfoForCommentCommand {
  constructor(public comment: any, public sortBy: string) {}
}

@CommandHandler(GetLikesInfoForCommentCommand)
export class GetLikesInfoForCommentUseCase
  implements ICommandHandler<GetLikesInfoForCommentCommand>
{
  constructor(private readonly likesRepository: LikesRepository) {}

  async execute(command: GetLikesInfoForCommentCommand) {
    const { comment } = command;
    const [likes, dislikes] = await Promise.all([
      this.likesRepository.getLikesCountByParentId(comment.id),
      this.likesRepository.getDislikesCountByParentId(comment.id),
    ]);
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin
      },
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: +likes,
        dislikesCount: +dislikes,
        myStatus: "None"
      }
    };
  }
}
