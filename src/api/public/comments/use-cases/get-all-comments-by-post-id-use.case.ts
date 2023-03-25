import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CommentsRepository } from '../repository/comments.repository';
import { GetLikesInfoForCommentCommand } from "../../likes/use-cases/get-likes-info-for-comment.use-case";

export class GetAllCommentsByPostIdCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: string,
    public postId: string,
    public userId: string,
  ) {}
}

@CommandHandler(GetAllCommentsByPostIdCommand)
export class GetAllCommentsByPostIdUseCase
  implements ICommandHandler<GetAllCommentsByPostIdCommand>
{
  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: GetAllCommentsByPostIdCommand) {
    const { pageNumber, pageSize, sortBy, sortDirection, postId, userId } = command;
    const countCommentsForPost =
      await this.commentsRepository.countCommentsForPost(postId);
    const allCommentsForPost = await this.commentsRepository.getAllCommentsForPost(
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      postId,
    );
    const result = [];
    for await (let comment of allCommentsForPost) {
      const mappedPost = await this.commandBus.execute(
        new GetLikesInfoForCommentCommand(comment, sortBy),
      );
      result.push(mappedPost);
    }
    return {
      pagesCount: Math.ceil(countCommentsForPost / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +countCommentsForPost,
      items: result,
    };
  }
}
