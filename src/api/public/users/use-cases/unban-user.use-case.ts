import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { UsersRepository } from '../repository/users.repository';

export class UnbanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: UnbanUserCommand) {
    const { id, dto } = command;
    return await this.usersRepository.unbanUser(id, dto);
  }
}
