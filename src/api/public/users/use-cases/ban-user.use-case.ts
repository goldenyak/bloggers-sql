import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { UsersRepository } from '../repository/users.repository';
import { LikesRepository } from "../../likes/repository/likes.repository";

export class BanUserCommand {
  constructor(public id: string, public dto: UpdateBanUserDto) {}
}

@CommandHandler(BanUserCommand)
export class BanUserUseCase implements ICommandHandler<BanUserCommand> {
  constructor(private readonly usersRepository: UsersRepository,
              private readonly likesRepository: LikesRepository) {}

  async execute(command: BanUserCommand) {
    const { id, dto } = command;
    const banDate = new Date().toISOString();
    await this.likesRepository.banUserLikes(id)
    return await this.usersRepository.banUser(id, dto, banDate);
  }
}
