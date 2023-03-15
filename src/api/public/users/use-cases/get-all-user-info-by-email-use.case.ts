import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUserInfoByEmailCommand {
  constructor(public email: string) {}
}

@CommandHandler(GetAllUserInfoByEmailCommand)
export class GetAllUserInfoByEmailUseCase
  implements ICommandHandler<GetAllUserInfoByEmailCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUserInfoByEmailCommand) {
    const { email } = command;
    const user = await this.usersRepository.getAllUserInfoByEmail(email);
    return user[0];
  }
}
