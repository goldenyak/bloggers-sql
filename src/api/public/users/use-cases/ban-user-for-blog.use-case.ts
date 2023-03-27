import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanUserForBlogDto } from "../../blogs/dto/update-ban-user-for-blog.dto";
import { UsersRepository } from "../repository/users.repository";

export class BanUserForBlogCommand {
  constructor(public ownerId: string, public bannedUserId: string, public bannedUserLogin: string, public blogId: string, public dto: UpdateBanUserForBlogDto, ) {}
}

@CommandHandler(BanUserForBlogCommand)
export class BanUserForBlogUseCase implements ICommandHandler<BanUserForBlogCommand> {
  constructor(
    private readonly usersRepository: UsersRepository
  ) {}

  async execute(command: BanUserForBlogCommand) {
    const { ownerId, bannedUserId, bannedUserLogin, blogId, dto} = command;
    const banDate = new Date().toISOString()
    return await this.usersRepository.banUserForBlog(ownerId, bannedUserId, bannedUserLogin, blogId, banDate);
  }
}