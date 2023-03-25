import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from "../../blogs/repository/blogs.repository";
import { UpdatePostDto } from "../dto/update-post.dto";
import { PostsRepository } from "../repository/posts.repository";

export class UpdatePostCommand {
  constructor(public dto: UpdatePostDto, public postId: string) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase
  implements ICommandHandler<UpdatePostCommand>
{
  constructor(private readonly postsRepository: PostsRepository) {}

  async execute(command: UpdatePostCommand) {
    const { dto, postId } = command;
    return await this.postsRepository.updatePostById(dto, postId)
  }
}
