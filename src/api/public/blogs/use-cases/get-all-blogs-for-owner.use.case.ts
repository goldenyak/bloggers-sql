import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../repository/blogs.repository';

export class GetAllBlogsForOwnerCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchNameTerm: string,
    public sortBy: string,
    public sortDirection: string,
    public userId: string
  ) {}
}

@CommandHandler(GetAllBlogsForOwnerCommand)
export class GetAllBlogsForOwnerUseCase
  implements ICommandHandler<GetAllBlogsForOwnerCommand>
{
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetAllBlogsForOwnerCommand) {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection, userId } =
      command;
    // const countBlogs = await this.blogsRepository.countBlogsForOwner(searchNameTerm, userId);
    return  await this.blogsRepository.getAllBlogsForOwner(
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      userId
    );
    // return {
    //   pagesCount: Math.ceil(countBlogs / pageSize),
    //   page: pageNumber,
    //   pageSize: pageSize,
    //   totalCount: countBlogs,
    //   items: allBlogs,
    // };
  }
}
