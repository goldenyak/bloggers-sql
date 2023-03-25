import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { PostsRepository } from "../repository/posts.repository";
import { GetLikesInfoForPostCommand } from "../../likes/use-cases/get-likes-info-for-post.use-case";

export class GetAllPostsCommand {
  constructor(
    public pageNumber: number,
    public pageSize: number,
    public sortBy: string,
    public sortDirection: any,
  ) {}
}

@CommandHandler(GetAllPostsCommand)
export class GetAllPostsUseCase implements ICommandHandler<GetAllPostsCommand> {
  constructor(private readonly postsRepository: PostsRepository,
              private readonly commandBus: CommandBus) {}

  async execute(command: GetAllPostsCommand) {
    const countAllPosts = await this.postsRepository.countAllPosts()
    const allPosts =  await this.postsRepository.getPostsWithPagination(
      command.pageNumber,
      command.pageSize,
      command.sortBy,
      command.sortDirection,
    );
    const result = [];
    for await (let post of allPosts) {
      const mappedPost = await this.commandBus.execute(new GetLikesInfoForPostCommand(post, command.sortBy));
      result.push(mappedPost);
    }
    return {
      pagesCount: Math.ceil(countAllPosts / command.pageSize),
      page: command.pageNumber,
      pageSize: command.pageSize,
      totalCount: +countAllPosts,
      items: result,
    };
  }
}
