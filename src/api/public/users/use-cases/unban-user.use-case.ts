import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { LikesRepository } from "../../likes/repository/likes.repository";

export class UnbanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto) {}
}

@CommandHandler(UnbanUserCommand)
export class UnbanUserUseCase implements ICommandHandler<UnbanUserCommand> {
  constructor(private readonly usersRepository: UsersRepository,
              private readonly likesRepository: LikesRepository) {}

  async execute(command: UnbanUserCommand) {
    const { id, dto } = command;
    await this.likesRepository.unbanUserLikes(id)
    return await this.usersRepository.unbanUser(id, dto);
  }
}
