import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../repository/posts.repository";
import { GetLikesInfoForPostCommand } from "../../likes/use-cases/get-likes-info-for-post.use-case";

export class GetAllPostsByBlogIdCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public searchNameTerm: string,
    public sortBy: string,
    public sortDirection: any,
    public blogId: string
  ) {}
}

@CommandHandler(GetAllPostsByBlogIdCommand)
export class GetAllPostsByBlogIdUseCase implements ICommandHandler<GetAllPostsByBlogIdCommand> {
  constructor(private readonly postsRepository: PostsRepository,
              private readonly commandBus: CommandBus) {}

  async execute(command: GetAllPostsByBlogIdCommand) {
    const countPostForBlog = await this.postsRepository.countPostForBlog(command.blogId)
    const allPostsForBlog = await this.postsRepository.getAllPostsByBlogId(
      command.pageNumber,
      command.pageSize,
      command.searchNameTerm,
      command.sortBy,
      command.sortDirection,
      command.blogId
    );
    const result = [];
    for await (let post of allPostsForBlog) {
      const mappedPost = await this.commandBus.execute(new GetLikesInfoForPostCommand(post, command.sortBy));
      result.push(mappedPost);
    }
    return {
      pagesCount: Math.ceil(countPostForBlog / command.pageSize),
      page: command.pageNumber,
      pageSize: command.pageSize,
      totalCount: +countPostForBlog,
      items: result,
    };
  }
}
