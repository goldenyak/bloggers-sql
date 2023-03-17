import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUserInfoByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(GetAllUserInfoByIdCommand)
export class GetAllUserInfoByIdUseCase
  implements ICommandHandler<GetAllUserInfoByIdCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUserInfoByIdCommand) {
    const { id } = command;
    const user = await this.usersRepository.getAllUserInfoById(id);
    return user[0];
  }
}
