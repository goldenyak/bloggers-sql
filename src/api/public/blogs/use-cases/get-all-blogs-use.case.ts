import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from "../repository/blogs.repository";

export class GetAllBlogsCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchNameTerm: string,
    public sortBy: string,
    public sortDirection: any,
  ) {}
}

@CommandHandler(GetAllBlogsCommand)
export class GetAllBlogsUseCase implements ICommandHandler<GetAllBlogsCommand> {
  constructor(private readonly blogsRepository: BlogsRepository) {}

  async execute(command: GetAllBlogsCommand) {
    return await this.blogsRepository.getBlogsWithPagination(
      command.pageNumber,
      command.pageSize,
      command.searchNameTerm,
      command.sortBy,
      command.sortDirection,
    );
  }
}
