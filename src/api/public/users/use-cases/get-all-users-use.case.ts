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
    return await this.usersRepository.getUsersWithPagination(
      command.pageNumber,
      command.pageSize,
      command.searchLoginTerm,
      command.searchEmailTerm,
      command.sortBy,
      command.sortDirection,
      command.banStatus,
    );
  }
}
