import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from "../repository/blogs.repository";

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdUseCase
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogByIdCommand) {
    const {blogId} = command;
    return await this.blogsRepository.deleteBlogById(blogId)
  }
}
