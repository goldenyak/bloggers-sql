import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostsRepository } from "../repository/posts.repository";

export class GetAllPostInfoByIdCommand {
  constructor(public postId: string) {}
}

@CommandHandler(GetAllPostInfoByIdCommand)
export class GetAllPostInfoByIdUseCase
  implements ICommandHandler<GetAllPostInfoByIdCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: GetAllPostInfoByIdCommand) {
    const { postId } = command;
    const res = await this.postsRepository.getAllPostInfoById(postId);
    return res[0];
  }
}
