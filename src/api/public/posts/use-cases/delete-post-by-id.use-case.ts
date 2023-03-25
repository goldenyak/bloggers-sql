import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from "../repository/posts.repository";

export class DeletePostByIdCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostByIdCommand)
export class DeletePostByIdUseCase
  implements ICommandHandler<DeletePostByIdCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: DeletePostByIdCommand) {
    const {postId} = command;
    return await this.postsRepository.deletePostById(postId)
  }
}
