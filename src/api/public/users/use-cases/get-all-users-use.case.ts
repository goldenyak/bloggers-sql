import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUsersCommand {
  constructor(
    public banStatus: string,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
    public sortBy: string,
    public sortDirection: string,
    public pageNumber: number,
    public pageSize: number,
  ) {}
}

@CommandHandler(GetAllUsersCommand)
export class GetAllUsersUseCase implements ICommandHandler<GetAllUsersCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUsersCommand) {
    const {
      banStatus,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize = 10,
    } = command;
  //   const usersCount = await this.usersRepository.countAllUsers(
  //     banStatus,
  //     searchLoginTerm,
  //     searchEmailTerm,
  //   );
  //   const usersArray = await this.usersRepository.getAllUsers();
  //   const userItems = usersArray.map((user) => {
  //     return {
  //       id: user.id,
  //       login: user.login,
  //       email: user.email,
  //       createdAt: user.createdAt,
  //       banInfo: {
  //         isBanned: user.isBanned,
  //         banDate: user.banDate,
  //         banReason: user.banReason,
  //       },
  //     };
  //   });
  //   return {
  //     pagesCount: Math.ceil(usersCount / pageSize),
  //     page: 2,
  //     pageSize: 10,
  //     totalCount: usersCount,
  //     items: userItems,
  //   };
    return await this.usersRepository.getUsersWithPagination(
      banStatus,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
    )
  }
}
