import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUsersCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchLoginTerm: string,
    public searchEmailTerm: string,
    public sortBy: string,
    public sortDirection: any,
    public banStatus: any,
  ) {}
}

@CommandHandler(GetAllUsersCommand)
export class GetAllUsersUseCase implements ICommandHandler<GetAllUsersCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUsersCommand) {
    const {
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      banStatus,
    } = command;
    return await this.usersRepository.getUsersWithPagination(
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      banStatus,
    );
    // return await this.usersRepository.getUsers(
    //   pageNumber,
    //   pageSize,
    //   searchLoginTerm,
    //   searchEmailTerm,
    //   sortBy,
    //   sortDirection,
    //   banStatus,
    // );
  }
}
