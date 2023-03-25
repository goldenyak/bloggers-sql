import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repository/blogs.repository';

export class GetAllBlogsWithOwnerInfoCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchNameTerm: string,
    public sortBy: string,
    public sortDirection: any,
  ) {}
}

@CommandHandler(GetAllBlogsWithOwnerInfoCommand)
export class GetAllBlogsWithOwnerInfoUseCase
  implements ICommandHandler<GetAllBlogsWithOwnerInfoCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetAllBlogsWithOwnerInfoCommand) {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } =
      command;
    const countBlogs = await this.blogsRepository.countBlogs(searchNameTerm);
    const allBlogs = await this.blogsRepository.getAllBlogsWithOwnerInfo(
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    );
    return {
      pagesCount: Math.ceil(countBlogs / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: countBlogs,
      items: allBlogs,
    };
  }
}
