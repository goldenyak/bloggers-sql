import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllBannedUsersCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchLoginTerm: string,
    public sortBy: string,
    public sortDirection: string,
    public blogId: string
  ) {}
}

@CommandHandler(GetAllBannedUsersCommand)
export class GetAllBannedUsersUseCase
  implements ICommandHandler<GetAllBannedUsersCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllBannedUsersCommand) {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm, blogId } =
      command;
    const countBannedUsers = await this.usersRepository.countAllBannedUsersForBlog(
      searchLoginTerm,
      sortBy,
      sortDirection,
      blogId
    );
    const allBannedUsers = await this.usersRepository.getAllBannedUsersForBlog(
      searchLoginTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      blogId
    );
    return {
      pagesCount: Math.ceil(countBannedUsers / pageSize),
      page: pageNumber,
      pageSize: pageSize,
      totalCount: countBannedUsers,
      items: allBannedUsers,
    };
  }
}
