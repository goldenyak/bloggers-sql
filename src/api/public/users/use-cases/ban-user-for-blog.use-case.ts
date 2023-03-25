import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserForBlogDto } from "../../blogs/dto/update-ban-user-for-blog.dto";
import { UsersRepository } from "../repository/users.repository";

export class BanUserForBlogCommand {
  constructor(public id: string, public dto: UpdateBanUserForBlogDto, ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: BanUserForBlogCommand) {
    const { id, dto} = command;
    const banDate = new Date().toISOString()
    return await this.usersRepository.banUser(id, dto, banDate);
  }
}