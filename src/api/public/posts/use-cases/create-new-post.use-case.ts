import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostsDto } from '../dto/create-post.dto';
import { PostsRepository } from "../repository/posts.repository";
import { GetAllPostInfoByIdCommand } from "./get-all-post-info-by-id-use.case";

export class CreateNewPostCommand {
  constructor(public dto: CreatePostsDto, public userId: string, public blogId: string, public blogName: string) {}
}

@CommandHandler(CreateNewPostCommand)
export class CreateNewPostUseCase
  implements ICommandHandler<CreateNewPostCommand> {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly commandBus: CommandBus,
  ) {
  }

  async execute(command: CreateNewPostCommand) {
    const { dto, userId, blogId, blogName } = command;
    const createdAt = new Date().toISOString();
    const newPost = await this.postsRepository.createPost(
      dto,
      userId,
      createdAt,
      blogId,
      blogName
    );
    if (newPost) {
      const post = await this.commandBus.execute(
        new GetAllPostInfoByIdCommand(newPost.id),
      );
        return {
          id: post.id,
          title: post.title,
          shortDescription: post.shortDescription,
          content: post.content,
          blogId: post.blogId,
          blogName: post.blogName,
          createdAt: post.createdAt,
          extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: 'None',
            newestLikes: [],
          },
        };
    }
  }
}
