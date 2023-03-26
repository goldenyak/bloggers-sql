import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { GetAllPostInfoByIdCommand } from '../../posts/use-cases/get-all-post-info-by-id-use.case';
import { GetAllBlogInfoByIdCommand } from '../use-cases/get-all-blog-info-by-id-use.case';
import { BasicAuthGuard } from '../../../../guards/basic-auth.guard';
import { Pagination } from '../../../../../classes/pagination';
import { GetAllUsersCommand } from '../../users/use-cases/get-all-users-use.case';
import { GetAllBlogsCommand } from "../use-cases/get-all-blogs-use.case";
import { GetAllPostsByBlogIdCommand } from "../../posts/use-cases/get-all-posts-by-blog-id-use.case";

@Controller('blogs')
export class BlogsController {
  constructor(private readonly commandBus: CommandBus) {}
  // -------------------------------------------------------------------------- //
  @HttpCode(200)
  @Get()
  async getAllBlogs(@Query() query: any) {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } =
      Pagination.getPaginationDataForBlogs(query);

    return this.commandBus.execute(
      new GetAllBlogsCommand(
        pageNumber,
        pageSize,
        searchNameTerm,
        sortBy,
        sortDirection,
      ),
    );
  }
  // -------------------------------------------------------------------------- //
  @HttpCode(200)
  @Get(':blogId/posts')
  async getAllPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: any,
  ) {
    const { pageNumber, pageSize, searchNameTerm, sortBy, sortDirection } =
      Pagination.getPaginationDataForBlogs(query);
    const blog = await this.commandBus.execute(new GetAllBlogInfoByIdCommand(blogId));
    if (!blog) {
      throw new NotFoundException();
    }
    return await this.commandBus.execute(
      new GetAllPostsByBlogIdCommand(pageNumber, pageSize, searchNameTerm, sortBy, sortDirection, blogId),
    );
  }
  // -------------------------------------------------------------------------- //
  @Get(':id')
  async findBlogById(@Param('id') id: string, @Req() req) {
    const blog = await this.commandBus.execute(
      new GetAllBlogInfoByIdCommand(id),
    );
    if (!blog || blog.isBanned) {
      throw new NotFoundException();
    }
    return {
      id: blog.blogId,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
  // -------------------------------------------------------------------------- //

  // -------------------------------------------------------------------------- //
}
