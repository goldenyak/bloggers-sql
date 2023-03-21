import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthGuard } from '../../../guards/basic-auth.guard';
import { CreateNewUserCommand } from '../../public/users/use-cases/create-new-user.use-case';
import { RegisterUserDto } from '../../public/auth/dto/register-user.dto';
import { CheckUserByLoginOrEmailCommand } from '../../public/users/use-cases/validate-user-for-register.use-case';
import { DeleteUserByIdCommand } from '../../public/users/use-cases/delete-user-by-id.use-case';
import { UpdateBanUserDto } from '../../public/users/dto/update-ban-user.dto';
import { GetAllUserInfoByIdCommand } from '../../public/users/use-cases/get-all-user-info-by-id-use.case';
import { UnbanUserCommand } from '../../public/users/use-cases/unban-user.use-case';
import { BanUserCommand } from '../../public/users/use-cases/ban-user.use-case';
import { DeleteAllSessionForBanUserCommand } from '../../public/sessions/use-cases/delete-all-session-for-ban-user.use-case';
import { UsersQueryDto } from '../../public/users/dto/users-query.dto';
import { GetAllUsersCommand } from '../../public/users/use-cases/get-all-users-use.case';
import { Pagination } from "../../../../classes/pagination";

@Controller('sa')
export class SuperAdminController {
  constructor(private readonly commandBus: CommandBus) {}
  // -------------------------------------------------------------- //
  @UseGuards(BasicAuthGuard)
  @HttpCode(201)
  @Post('/users')
  async create(@Body() dto: RegisterUserDto, @Req() req: Request) {
    const { login, password, email } = dto;
    await this.commandBus.execute(
      new CheckUserByLoginOrEmailCommand(login, email),
    );
    return await this.commandBus.execute(
      new CreateNewUserCommand(login, password, email),
    );
  }
  // -------------------------------------------------------------- //
  @UseGuards(BasicAuthGuard)
  @HttpCode(200)
  @Get('/users')
  async getAllUsers(@Query() query: any) {
    const {
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
      sortBy,
      sortDirection,
      banStatus,
    } = Pagination.getPaginationDataForUser(query);

    return this.commandBus.execute(
      new GetAllUsersCommand(
        pageNumber,
        pageSize,
        searchLoginTerm,
        searchEmailTerm,
        sortBy,
        sortDirection,
        banStatus,
      ),
    );
  }
  // -------------------------------------------------------------- //
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Delete('/users/:id')
  async deleteUserById(@Param('id') id: string) {
    const foundedUser = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(id),
    );
    if (!foundedUser) {
      throw new NotFoundException();
    }
    return await this.commandBus.execute(new DeleteUserByIdCommand(id));
  }
  // -------------------------------------------------------------- //
  @UseGuards(BasicAuthGuard)
  @HttpCode(204)
  @Put('/users/:id/ban')
  async updateBanUser(@Param('id') id: string, @Body() dto: UpdateBanUserDto) {
    const foundedUser = await this.commandBus.execute(
      new GetAllUserInfoByIdCommand(id),
    );
    if (!foundedUser) {
      throw new NotFoundException();
    }
    if (!dto.isBanned) {
      // await this.commandBus.execute(new UnbanUserLikeStatusCommand(id));
      return await this.commandBus.execute(new UnbanUserCommand(id, dto));
    }
    await this.commandBus.execute(new BanUserCommand(id, dto));
    // await this.commandBus.execute(new BanUserLikeStatusCommand(id));
    return await this.commandBus.execute(
      new DeleteAllSessionForBanUserCommand(id),
    );
  }
  // -------------------------------------------------------------- //
  // 	@UseGuards(BasicAuthGuard)
  // 	@HttpCode(200)
  // 	@Get('/blogs')
  // 	async getBlogs(@Query() queryParams: BlogsQueryParams) {
  // 		const commandOptions = {
  // 			...queryParams,
  // 			returnBanned: true
  // 		}
  // 		return this.commandBus.execute(new GetAllBlogsCommand(commandOptions));
  // 	}
  // -------------------------------------------------------------- //
  // 	@UseGuards(BasicAuthGuard)
  // 	@HttpCode(204)
  // 	@Put('/blogs/:id/ban')
  // 	async updateBanBlog(@Param('id') id: string, @Body() dto: UpdateBanBlogDto) {
  // 		const foundedBlog = await this.commandBus.execute(new GetBlogByIdWithOwnerInfoCommand(id));
  // 		if (!foundedBlog) {
  // 			throw new NotFoundException();
  // 		}
  // 		if (!dto.isBanned) {
  // 			return await this.commandBus.execute(new UnBanBlogCommand(id, dto));
  // 		}
  // 		await this.commandBus.execute(new BanBlogCommand(id, dto));
  // 	}
  // -------------------------------------------------------------- //
}
