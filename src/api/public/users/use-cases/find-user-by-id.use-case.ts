import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class FindUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(FindUserByIdCommand)
export class FindUserByIdUseCase
  implements ICommandHandler<FindUserByIdCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: FindUserByIdCommand) {
    const { id } = command;
    const user = await this.usersRepository.findUserById(id);
    return user[0]
  }
}
