import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserForBlogDto } from "../../blogs/dto/update-ban-user-for-blog.dto";
import { UsersRepository } from "../repository/users.repository";

export class UnBanUserForBlogCommand {
  constructor(public bannedUserId: string, public blogId: string ) {}
}

@CommandHandler(UnBanUserForBlogCommand)
export class UnBanUserForBlogUseCase implements ICommandHandler<UnBanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: UnBanUserForBlogCommand) {
    const {bannedUserId, blogId} = command;
    return await this.usersRepository.unbanUserForBlog(bannedUserId, blogId );
  }
}