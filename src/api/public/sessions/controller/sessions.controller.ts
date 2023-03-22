import {
	Controller,
	Delete,
	ForbiddenException,
	Get,
	HttpCode,
	Injectable,
	NotFoundException,
	Param,
	Req,
	UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { CommandBus } from "@nestjs/cqrs";
import { FindUserByIdCommand } from "../../users/use-cases/find-user-by-id.use-case";
import { DeleteSessionCommand } from "../use-cases/delete-session.use-case";
import { CheckRefreshTokenCommand } from "../../auth/use-cases/check-refresh-token.use-case";
import { GetAllSessionsCommand } from "../../auth/use-cases/get-all-sessions.use-case";
import { GetSessionByDeviceIdCommand } from "../../auth/use-cases/get-session-by-device-id.use-case";
import { GetAllUserInfoByLoginCommand } from "../../users/use-cases/get-all-user-info-by-login-use.case";
import { DeleteAllSessionsWithExcludeCommand } from "../use-cases/delete-all-sessions-with-exclude.use-case";
import { GetAllUserInfoByEmailCommand } from "../../users/use-cases/get-all-user-info-by-email-use.case";


@Injectable()
@Controller('security')
export class SessionsController {
	constructor(
		private readonly commandBus: CommandBus,
	) {}
// ---------------------------------------------------- //
	@HttpCode(200)
	@Get('devices')
	async getAllSessions(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken))
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentUser = await this.commandBus.execute(new FindUserByIdCommand(tokenPayload.id));
		if (currentUser) {
			return await this.commandBus.execute(new GetAllSessionsCommand(tokenPayload.id))
		}
	}
// --------------------------------------------------- //
	@HttpCode(204)
	@Delete('devices')
	async deleteAllSessions(@Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken))
		const currentUser = await this.commandBus.execute(new GetAllUserInfoByLoginCommand(tokenPayload.login));
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentSession = await this.commandBus.execute(new GetSessionByDeviceIdCommand(tokenPayload.deviceId))
		if (currentSession.deviceId === tokenPayload.deviceId) {
			return await this.commandBus.execute(new DeleteAllSessionsWithExcludeCommand(currentSession.deviceId, currentUser.id))
		}
	}
// --------------------------------------------------- //
	@HttpCode(204)
	@Delete('devices/:deviceId')
	async deleteSessionByDeviceId(@Param('deviceId') deviceId: string, @Req() req: Request) {
		const refreshToken = req.cookies.refreshToken;
		const tokenPayload = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken))
		if (!refreshToken || !tokenPayload) {
			throw new UnauthorizedException();
		}
		const currentUser = await this.commandBus.execute(new GetAllUserInfoByEmailCommand(tokenPayload.email));
		const currentSession = await this.commandBus.execute(new GetSessionByDeviceIdCommand(deviceId))
		if (!currentSession) {
			throw new NotFoundException();
		}
		if (currentSession.userId !== currentUser.userId) {
			throw new ForbiddenException();
		}
		if (currentSession.userId === currentUser.userId) {
			return await this.commandBus.execute(new DeleteSessionCommand(deviceId));
		}
	}
// --------------------------------------------------- //
}
