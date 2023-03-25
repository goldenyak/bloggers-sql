import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { CommentsRepository } from '../repository/comments.repository';
import { GetAllCommentInfoByIdCommand } from "./get-all-comment-info-by-id.use-case";

export class CreateNewCommentCommand {
  constructor(
    public parentId: string,
    public userId: string,
    public userLogin: string,
    public dto: CreateCommentDto,
  ) {}
}

@CommandHandler(CreateNewCommentCommand)
export class CreateNewCommentUseCase
  implements ICommandHandler<CreateNewCommentCommand>
{
  constructor(
    private readonly commandBus: CommandBus,
    private readonly commentsRepository: CommentsRepository,
  ) {}

  async execute(command: CreateNewCommentCommand) {
    const { parentId, userId, userLogin, dto } = command;
    const createdAt = new Date().toISOString();
    const comment = await this.commentsRepository.createComment(
      parentId,
      userId,
      userLogin,
      dto,
      createdAt,
    );
    if (comment) {
      const newComment = await this.commandBus.execute(new GetAllCommentInfoByIdCommand(comment.id))
      return {
        id: newComment.id,
        content: newComment.content,
        commentatorInfo: {
         userId: userId,
         userLogin: userLogin
        },
        createdAt: newComment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None"
        }
      };
    }
  }
}
