import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUsersCommand {
  constructor() {}
}

@CommandHandler(GetAllUsersCommand)
export class GetAllUsersUseCase
  implements ICommandHandler<GetAllUsersCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUsersCommand) {
    const {  } = command;
    const usersArray = await this.usersRepository.getAllUsers();
    const userItems = usersArray.map((user) => {
      return {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      };
    });
    return {
      pagesCount: 2,
      page: 2,
      pageSize: 10,
      totalCount: 3,
      items: userItems
    };
  }
}
