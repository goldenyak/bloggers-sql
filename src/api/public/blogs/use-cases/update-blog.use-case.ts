import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { v4 as uuidv4 } from 'uuid';
import { BlogsRepository } from '../repository/blogs.repository';
import { CreateBlogDto } from '../dto/create-blog.dto';
import { Blogs } from '../../../../entities/blog/blog.entity';
import { GetAllUserInfoByLoginCommand } from '../../users/use-cases/get-all-user-info-by-login-use.case';
import { GetAllBlogInfoByIdCommand } from "./get-all-blog-info-by-id-use.case";
import { UpdateBlogDto } from "../dto/update-blog.dto";

export class UpdateBlogCommand {
  constructor(public dto: UpdateBlogDto, public blogId: string) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase
  implements ICommandHandler<UpdateBlogCommand>
{
  constructor(
    private readonly blogsRepository: BlogsRepository,
  ) {}

  async execute(command: UpdateBlogCommand) {
    const { dto, blogId } = command;
    return await this.blogsRepository.updateBlogById(dto, blogId)
  }
}
