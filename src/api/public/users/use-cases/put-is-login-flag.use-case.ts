import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class PutIsLoginFlagCommand {
  constructor(public userId: string) {}
}

@CommandHandler(PutIsLoginFlagCommand)
export class PutIsLoginFlagUseCase
  implements ICommandHandler<PutIsLoginFlagCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
  ) {}

  async execute(command: PutIsLoginFlagCommand) {
    const {userId} = command
    return await this.usersRepository.putIsLoginFlag(userId);
  }
}
