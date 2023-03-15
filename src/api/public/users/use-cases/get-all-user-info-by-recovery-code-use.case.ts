import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';

export class GetAllUserInfoByRecoveryCodeCommand {
  constructor(public recoveryCode: string) {}
}

@CommandHandler(GetAllUserInfoByRecoveryCodeCommand)
export class GetAllUserInfoByRecoveryCodeUseCase
  implements ICommandHandler<GetAllUserInfoByRecoveryCodeCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: GetAllUserInfoByRecoveryCodeCommand) {
    const { recoveryCode } = command;
    const user = await this.usersRepository.getAllUserInfoByRecoveryCode(recoveryCode);
    return user[0];
  }
}
