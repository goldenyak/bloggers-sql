import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
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
import { JwtAuthGuard } from '../../../guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateBlogDto } from '../../public/blogs/dto/create-blog.dto';
import { GetAllUserInfoByLoginCommand } from '../../public/users/use-cases/get-all-user-info-by-login-use.case';
import { CreateNewBlogCommand } from '../../public/blogs/use-cases/create-new-blog.use-case';
import { GetAllBlogInfoByIdCommand } from '../../public/blogs/use-cases/get-all-blog-info-by-id-use.case';
import { DeleteBlogByIdCommand } from '../../public/blogs/use-cases/delete-blog-by-id.use-case';
import { UpdateBlogDto } from '../../public/blogs/dto/update-blog.dto';
import { UpdateBlogCommand } from '../../public/blogs/use-cases/update-blog.use-case';
import { FindUserByIdCommand } from '../../public/users/use-cases/find-user-by-id.use-case';
import { UpdateBanUserForBlogDto } from '../../public/blogs/dto/update-ban-user-for-blog.dto';
import { UnbanUserLikeStatusCommand } from '../../public/likes/use-cases/unban-user-like-status.use-case';
import { BanUserLikeStatusCommand } from '../../public/likes/use-cases/ban-user-like-status.use-case';
import { DeleteAllSessionForBanUserCommand } from '../../public/sessions/use-cases/delete-all-session-for-ban-user.use-case';
import { UnBanUserForBlogCommand } from '../../public/users/use-cases/unban-user-for-blog.use-case';
import { BanUserForBlogCommand } from '../../public/users/use-cases/ban-user-for-blog.use-case';
import { CreatePostsDto } from '../../public/posts/dto/create-post.dto';
import { CreateNewPostCommand } from '../../public/posts/use-cases/create-new-post.use-case';
import { GetAllPostInfoByIdCommand } from '../../public/posts/use-cases/get-all-post-info-by-id-use.case';
import { DeletePostByIdCommand } from '../../public/posts/use-cases/delete-post-by-id.use-case';
import { UpdatePostDto } from '../../public/posts/dto/update-post.dto';
import { UpdatePostCommand } from '../../public/posts/use-cases/update-post.use-case';
import { GetAllUserInfoByIdCommand } from '../../public/users/use-cases/get-all-user-info-by-id-use.case';
import { GetAllBlogsForOwnerCommand } from '../../public/blogs/use-cases/get-all-blogs-for-owner.use.case';
import { Pagination } from '../../../../classes/pagination';
import { GetAllBannedUsersCommand } from '../../public/users/use-cases/get-all-banned-users.use-case';
import { User } from "../../../decorators/user.decorator";


@Controller('blogger')
export class BloggersController {
  constructor(private readonly commandBus: CommandBus) {}
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @Post('/blogs')
  async createBlog(@Body() dto: CreateBlogDto, @Req() req) {
    const { login } = req.user;
    const user = await this.commandBus.execute(
      new GetAllUserInfoByLoginCommand(login),
    );
    if (!user || user.isBanned) {
      throw new UnauthorizedException();
    }
    return await this.commandBus.execute(
      new CreateNewBlogCommand(dto, user.userId, user.login),
    );
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/blogs')
  async getAllBlogsForOwner(@Query() query: any, @Req() req) {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } =
      Pagination.getPaginationDataForBlogs(query);
    const user = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(req.user.id),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return await this.commandBus.execute(
      new GetAllBlogsForOwnerCommand(
        pageNumber,
        pageSize,
        searchNameTerm,
        sortBy,
        sortDirection,
        user.userId,
      ),
    );
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @Get('/users/blog/:id')
  async getAllBannedUsersForBlog(
    @Param('id') id: string,
    @Query() query,
    @Req() req,
  ) {
    const { pageNumber, pageSize, searchLoginTerm, sortBy, sortDirection } =
      Pagination.getPaginationDataForBannedUsers(query);
    const user = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(req.user.id),
    );
    const blog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(id),
    );
    console.log(blog);
    if (!blog) {
      throw new NotFoundException();
    }
    if (user.userId !== blog.userId || !user) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(
      new GetAllBannedUsersCommand(
        pageNumber,
        pageSize,
        searchLoginTerm,
        sortBy,
        sortDirection,
        user.userId
      ),
    );
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/blogs/:id')
  async deleteBlogById(@Param('id') id: string, @Req() req) {
    const foundedBlog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(id),
    );
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    if (foundedBlog.userId !== req.user.id) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(new DeleteBlogByIdCommand(id));
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('/blogs/:id')
  async updateBlogById(
    @Body() dto: UpdateBlogDto,
    @Param('id') id: string,
    @Req() req,
  ) {
    const foundedBlog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(id),
    );
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    if (foundedBlog.userId !== req.user.id) {
      throw new ForbiddenException();
    }

    return await this.commandBus.execute(new UpdateBlogCommand(dto, id));
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('/users/:id/ban')
  async updateBanUserForBlog(
    @Param('id') id: string,
    @Body() dto: UpdateBanUserForBlogDto,
    @Req() req,
  ) {
    const blog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(dto.blogId),
    );
    if (!blog) {
      throw new NotFoundException();
    }
    if (blog.userId !== req.user.id) {
      throw new ForbiddenException();
    }
    const foundedUser = await this.commandBus.execute(
      new FindUserByIdCommand(id),
    );
    if (!foundedUser) {
      throw new NotFoundException();
    }
    if (dto.isBanned) {
      await this.commandBus.execute(new BanUserForBlogCommand(id, dto));
      await this.commandBus.execute(new BanUserLikeStatusCommand(id));
      return await this.commandBus.execute(
        new DeleteAllSessionForBanUserCommand(id),
      );
    }
    await this.commandBus.execute(new UnbanUserLikeStatusCommand(id));
    return await this.commandBus.execute(
      new UnBanUserForBlogCommand(id, dto),
    );
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @Post('/blogs/:blogId/posts')
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() dto: CreatePostsDto,
    @Req() req,
  ) {
    const foundedBlog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(blogId),
    );
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    if (foundedBlog.userId !== req.user.id) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(
      new CreateNewPostCommand(
        dto,
        req.user.id,
        foundedBlog.blogId,
        foundedBlog.name,
      ),
    );
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Delete('/blogs/:blogId/posts/:postId')
  async deletePostForSpecifiedBlog(
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @User() user
  ) {
    const foundedBlog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(blogId),
    );
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    if (foundedBlog.userId !== user.id) {
      throw new ForbiddenException();
    }
    const foundedPost = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(postId),
    );
    if (!foundedPost) {
      throw new NotFoundException();
    }
    if (foundedPost.blogId !== blogId) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(new DeletePostByIdCommand(postId));
  }
  // -------------------------------------------------------------------------- //
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  @Put('/blogs/:blogId/posts/:postId')
  async updatePostForSpecifiedBlog(
    @Body() dto: UpdatePostDto,
    @Param('blogId') blogId: string,
    @Param('postId') postId: string,
    @Req() req,
  ) {
    const foundedBlog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(blogId),
    );
    if (!foundedBlog) {
      throw new NotFoundException();
    }
    if (foundedBlog.userId !== req.user.id) {
      throw new ForbiddenException();
    }
    const foundedPost = await this.commandBus.execute(
      new GetAllPostInfoByIdCommand(postId),
    );
    if (!foundedPost) {
      throw new NotFoundException();
    }
    if (foundedPost.blogId !== blogId) {
      throw new ForbiddenException();
    }
    return await this.commandBus.execute(new UpdatePostCommand(dto, postId));
  }
  // -------------------------------------------------------------------------- //
}
