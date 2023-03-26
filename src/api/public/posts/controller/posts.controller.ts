import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Headers,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { GetAllPostInfoByIdCommand } from '../use-cases/get-all-post-info-by-id-use.case';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../../guards/jwt-auth.guard';
import { CreateCommentDto } from '../../comments/dto/create-comment.dto';
import { FindUserByIdCommand } from '../../users/use-cases/find-user-by-id.use-case';
import { CreateNewCommentCommand } from '../../comments/use-cases/create-comment.use-case';
import { GetAllUserInfoByIdCommand } from '../../users/use-cases/get-all-user-info-by-id-use.case';
import { LikePostDto } from '../../likes/dto/like-post.dto';
import { CreateLikeCommand } from '../../likes/use-cases/create-like.use-case';
import { BasicAuthGuard } from '../../../../guards/basic-auth.guard';
import { Pagination } from '../../../../../classes/pagination';
import { GetAllBlogsCommand } from '../../blogs/use-cases/get-all-blogs-use.case';
import { GetAllPostsCommand } from '../use-cases/get-all-posts-use.case';
import { CheckRefreshTokenCommand } from '../../auth/use-cases/check-refresh-token.use-case';
import { GetAllCommentsByPostIdCommand } from '../../comments/use-cases/get-all-comments-by-post-id-use.case';
import { GetAllBlogInfoByIdCommand } from "../../blogs/use-cases/get-all-blog-info-by-id-use.case";

@Controller('posts')
export class PostsController {
  constructor(private readonly commandBus: CommandBus) {}

  // -------------------------------------------------------------------------- //
  @HttpCode(200)
  @Get()
  async getAllPosts(@Query() query: any) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      Pagination.getPaginationDataForPosts(query);

    return this.commandBus.execute(
      new GetAllPostsCommand(pageNumber, pageSize, sortBy, sortDirection),
    );
  }

  // -------------------------------------------------------------------------- //
  @Get(':id')
  async findPostById(
    @Param('id') id: string,
    @Req() req,
    @Headers('authorization') header: string,
  ) {
    const post = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(id),
    );
    if (!post) {
      throw new NotFoundException();
    }
    const blog = await this.commandBus.execute(new GetAllBlogInfoByIdCommand(post.blogId))
    if (blog.isBanned) {
      throw new NotFoundException();
    }
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

  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @Post(':postId/comments')
  async createCommentByPostId(
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
    @Req() req,
  ) {
    const user = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(req.user.id),
    );
    if (!user) {
      throw new NotFoundException();
    }
    if (user.isBanned) {
      throw new ForbiddenException();
    }
    const postById = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(postId),
    );
    if (!postById) {
      throw new NotFoundException();
    } else {
      return await this.commandBus.execute(
        new CreateNewCommentCommand(postId, user.userId, user.login, dto),
      );
    }
  }

  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put(':id/like-status')
  async addLikeForPost(
    @Body() dto: LikePostDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const post = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(id),
    );
    if (!post) {
      throw new NotFoundException();
    }
    const user = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(req.user.id),
    );
    if (!user || user.isBanned) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(
      new CreateLikeCommand(
        post.id,
        user.userId,
        user.login,
        user.isBanned,
        dto.likeStatus,
      ),
    );
  }

  // -------------------------------------------------------------------------- //
  @HttpCode(200)
  @Get(':id/comments')
  async getAllCommentsByPostId(
    @Param('id') id: string,
    @Query() query: any,
    @Req() req,
    @Headers('authorization') header: string,
  ) {
    const { pageNumber, pageSize, sortBy, sortDirection } =
      Pagination.getPaginationDataForPosts(query);
    let currentUserId = null;
    if (req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const result = await this.commandBus.execute(
        new CheckRefreshTokenCommand(token),
      );
      if (result) {
        currentUserId = result.id;
      }
    }
    const post = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(id),
    );
    if (!post) {
      throw new NotFoundException();
    }
    return await this.commandBus.execute(
      new GetAllCommentsByPostIdCommand(
        pageNumber,
        pageSize,
        sortBy,
        sortDirection,
        id,
        currentUserId,
      ),
    );
  }
  // -------------------------------------------------------------------------- //
  // -------------------------------------------------------------------------- //
  // -------------------------------------------------------------------------- //
}
