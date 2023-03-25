import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsRepository } from '../repository/comments.repository';

export class GetAllCommentInfoByIdCommand {
  constructor(
    public commentId: string,
  ) {}
}

@CommandHandler(GetAllCommentInfoByIdCommand)
export class GetAllCommentInfoByIdUseCase
  implements ICommandHandler<GetAllCommentInfoByIdCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: GetAllCommentInfoByIdCommand) {
    const { commentId } = command;
    const res = await this.commentsRepository.getAllCommentInfoById(commentId);
    return res[0];

  }
}
