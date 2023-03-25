import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { BlogsRepository } from '../repository/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blogs } from '../../../../entities/blog/blog.entity';
import { GetAllUserInfoByLoginCommand } from '../../users/use-cases/get-all-user-info-by-login-use.case';
import { GetAllBlogInfoByIdCommand } from "./get-all-blog-info-by-id-use.case";

export class CreateNewBlogCommand {
  constructor(public dto: CreateBlogDto, public userId: string, public userLogin: string) {}
}

@CommandHandler(CreateNewBlogCommand)
export class CreateNewBlogUseCase
  implements ICommandHandler<CreateNewBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateNewBlogCommand) {
    const { dto, userId, userLogin } = command;
    const createdAt = new Date().toISOString();
    const newBlogId = await this.blogsRepository.createBlog(
      dto,
      userId,
      userLogin,
      createdAt,
    );
    if (newBlogId) {
      const blog = await this.commandBus.execute(
        new GetAllBlogInfoByIdCommand(newBlogId),
      );
      return {
        id: blog.blogId,
        name: blog.name,
        description: blog.description,
        websiteUrl: blog.websiteUrl,
        createdAt: blog.createdAt,
        isMembership: blog.isMembership,
      };
    }
  }
}
