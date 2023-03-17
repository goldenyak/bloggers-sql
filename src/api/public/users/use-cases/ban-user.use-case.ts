import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from "../dto/update-ban-user.dto";
import { UsersRepository } from "../repository/users.repository";


export class BanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto, ) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: BanUserCommand) {
    const { id, dto} = command;
    return await this.usersRepository.banUser(id, dto);
  }
}