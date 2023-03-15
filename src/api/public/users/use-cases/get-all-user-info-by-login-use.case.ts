import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUserInfoByLoginCommand {
  constructor(public login: string) {}
}

@CommandHandler(GetAllUserInfoByLoginCommand)
export class GetAllUserInfoByLoginUseCase
  implements ICommandHandler<GetAllUserInfoByLoginCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUserInfoByLoginCommand) {
    const { login } = command;
    const user = await this.usersRepository.getAllUserInfoByLogin(login);
    return user[0];
  }
}
