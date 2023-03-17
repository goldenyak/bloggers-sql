import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class DeleteUserByIdCommand {
  constructor(public id: string) {}
}

@CommandHandler(DeleteUserByIdCommand)
export class DeleteUserByIdUseCase
  implements ICommandHandler<DeleteUserByIdCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserByIdCommand) {
    const { id } = command;
    return await this.usersRepository.deleteUserById(id);
  }
}
