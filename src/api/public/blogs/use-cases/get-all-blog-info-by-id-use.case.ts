import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repository/blogs.repository';

export class GetAllBlogInfoByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetAllBlogInfoByIdCommand)
export class GetAllBlogInfoByIdUseCase
  implements ICommandHandler<GetAllBlogInfoByIdCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetAllBlogInfoByIdCommand) {
    const { blogId } = command;
    const res = await this.blogsRepository.getAllBlogInfoById(blogId);
    return res[0];
  }
}
