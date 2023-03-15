import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class FindUserByLoginCommand {
  constructor(public login: string) {}
}

@CommandHandler(FindUserByLoginCommand)
export class FindUserByLoginUseCase
  implements ICommandHandler<FindUserByLoginCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: FindUserByLoginCommand) {
    const { login } = command;
    const user = await this.usersRepository.findUserByLogin(login);
    return user[0]
  }
}
