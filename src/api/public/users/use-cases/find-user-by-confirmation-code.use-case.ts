import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class FindUserByConfirmationCodeCommand {
  constructor(public confirmationCode: string) {}
}

@CommandHandler(FindUserByConfirmationCodeCommand)
export class FindUserByConfirmationCodeUseCase
  implements ICommandHandler<FindUserByConfirmationCodeCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: FindUserByConfirmationCodeCommand) {
    const { confirmationCode } = command;
    const user = await this.usersRepository.findUserByConfirmationCode(
      confirmationCode,
    );
    return user[0];
  }
}
