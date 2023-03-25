import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserForBlogDto } from "../../blogs/dto/update-ban-user-for-blog.dto";
import { UsersRepository } from "../repository/users.repository";

export class UnBanUserForBlogCommand {
  constructor(public id: string, public dto: UpdateBanUserForBlogDto, ) {}
}

@CommandHandler(UnBanUserForBlogCommand)
export class UnBanUserForBlogUseCase implements ICommandHandler<UnBanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: UnBanUserForBlogCommand) {
    const { id, dto} = command;
    return await this.usersRepository.unbanUser(id, dto);
  }
}