import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class UndoIsLoginFlagCommand {
  constructor(public userId: string) {}
}

@CommandHandler(UndoIsLoginFlagCommand)
export class UndoIsLoginFlagUseCase
  implements ICommandHandler<UndoIsLoginFlagCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: UndoIsLoginFlagCommand) {
    const {userId} = command
    return await this.usersRepository.undoIsLoginFlag(userId);
  }
}
