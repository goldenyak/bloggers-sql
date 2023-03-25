import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllBannedUsersCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchLoginTerm: string,
    public sortBy: string,
    public sortDirection: string,
  ) {}
}

@CommandHandler(GetAllBannedUsersCommand)
export class GetAllBannedUsersUseCase
  implements ICommandHandler<GetAllBannedUsersCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllBannedUsersCommand) {
    const { pageNumber, pageSize, sortBy, sortDirection, searchLoginTerm } =
      command;
    const countBannedUsers = await this.usersRepository.countAllBannedUsers(
      searchLoginTerm,
      sortBy,
      sortDirection,
    );
    const allBannedUsers = await this.usersRepository.getAllBannedUsers(
      searchLoginTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
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
