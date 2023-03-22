import {
	BadRequestException,
	Body,
	Controller, Get,
	HttpCode, Ip,
	Post,
	Req,
	Res, UnauthorizedException,
	UseGuards
} from "@nestjs/common";
import { Response } from 'express';
import { Request } from 'express';
import { CommandBus } from '@nestjs/cqrs';
import { RegisterUserDto } from './dto/register-user.dto';
import { CreateNewUserCommand } from '../users/use-cases/create-new-user.use-case';
import { CheckUserByLoginOrEmailCommand } from '../users/use-cases/validate-user-for-register.use-case';
import { SendConfirmEmailCommand } from './use-cases/send-confirm-email.use-case';
import { ThrottlerIpGuard } from '../../../guards/throttle-ip.guard';
import { LoginUserDto } from './dto/login-user.dto';
import { ValidateUserForLoginCommand } from "../users/use-cases/validate-user-for-login.use-case";
import { LoginCommand } from "./use-cases/login.use-case";
import { CreateNewSessionCommand } from "../sessions/use-cases/create-new-session.use-case";
import { CheckRefreshTokenCommand } from "./use-cases/check-refresh-token.use-case";
import { GetLastActiveSessionCommand } from "./use-cases/get-last-active-session.use-case";
import { CreateNewTokenCommand } from "./use-cases/create-new-token.use-case";
import { GetNewPayloadFromRefreshTokenCommand } from "./use-cases/get-last-active-date-from-refresh-token.use-case";
import { UpdateSessionAfterRefreshCommand } from "../sessions/use-cases/update-session-after-refresh.use-case";
import { DeleteSessionCommand } from "../sessions/use-cases/delete-session.use-case";
import { FindUserByCodeDto } from "../users/dto/find-user-by-code.dto";
import { FindUserByConfirmationCodeCommand } from "../users/use-cases/find-user-by-confirmation-code.use-case";
import { UpdateConfirmationCodeCommand } from "../users/use-cases/update-confirmation-code.use-case";
import { GetAllUserInfoByEmailCommand } from "../users/use-cases/get-all-user-info-by-email-use.case";
import { EmailResendingDto } from "../../../email/dto/email-resending.dto";
import { SendNewConfirmEmailCommand } from "./use-cases/send-new-confirm-email.use-case";
import { SendRecoveryPasswordEmailCommand } from "../../../email/use-cases/send-recovery-password-email.use-case";
import { NewPasswordDto } from "./dto/new-password.dto";
import { GetAllUserInfoByRecoveryCodeCommand } from "../users/use-cases/get-all-user-info-by-recovery-code-use.case";
import { SetNewPasswordCommand } from "./use-cases/set-new-password.use-case";
import { JwtAuthGuard } from "../../../guards/jwt-auth.guard";
import { FindUserByIdCommand } from "../users/use-cases/find-user-by-id.use-case";
import { UndoIsLoginFlagCommand } from "../users/use-cases/undo-is-login-flag.use-case";
import { v4 as uuidv4 } from 'uuid';
import { UpdateDevicesCommand } from "../sessions/use-cases/update-devices.use-case";

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}
// ----------------------------------------------------------------------- //
  @UseGuards(ThrottlerIpGuard)
  @HttpCode(204)
  @Post('registration')
  async register(@Body() dto: RegisterUserDto) {
    const { login, password, email } = dto;
    await this.commandBus.execute(
      new CheckUserByLoginOrEmailCommand(login, email),
    );
    await this.commandBus.execute(
      new CreateNewUserCommand(login, password, email),
    );
    await this.commandBus.execute(new SendConfirmEmailCommand(email));
    return;
  }
// ----------------------------------------------------------------------- //
  @UseGuards(ThrottlerIpGuard)
  @HttpCode(200)
  @Post('login')
  async login(
  	@Res({ passthrough: true }) res: Response,
  	@Req() req: Request,
  	@Body() dto: LoginUserDto,
		@Ip() ip: string,
  ) {
  	const sessionTitle = req.headers['user-agent'];

  	const user = await this.commandBus.execute(
  		new ValidateUserForLoginCommand(dto.loginOrEmail, dto.password),
  	);
  	const { accessToken, refreshToken } = await this.commandBus.execute(
  		new LoginCommand(user.email, user.userId, user.login),
  	);
  	await this.commandBus.execute(
  		new CreateNewSessionCommand(ip, user.userId, refreshToken, sessionTitle),
  	);
  	res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
  	return {
  		accessToken,
  		refreshToken,
  	};
  }
  // ----------------------------------------------------------------------- //
  @HttpCode(200)
  @Post('refresh-token')
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  	const refreshToken = req.cookies.refreshToken;
  	if (!req.cookies || !refreshToken) {
  		throw new UnauthorizedException();
  	}
		const tokens = await this.commandBus.execute(new UpdateDevicesCommand(refreshToken))
		if (!tokens) {
			throw new UnauthorizedException();
		}
  	res.cookie('refreshToken', tokens.newRefreshToken, { httpOnly: true, secure: true });
  	return {
  		accessToken: tokens.newAccessToken,
  		refreshToken: tokens.newRefreshToken,
  	};
  }
// ----------------------------------------------------------------------- //
	@HttpCode(204)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
  	const refreshToken = await req.cookies.refreshToken;
  	if (!refreshToken) {
  		throw new UnauthorizedException();
  	}
  	const result = await this.commandBus.execute(new CheckRefreshTokenCommand(refreshToken));
  	if (!result) {
  		throw new UnauthorizedException();
  	}
  	const payload = await this.commandBus.execute(
  		new GetNewPayloadFromRefreshTokenCommand(refreshToken),
  	);
  	const foundedDevice = await this.commandBus.execute(
  		new GetLastActiveSessionCommand(result.id, result.deviceId, payload.iat),
  	);
  	if (!foundedDevice) {
  		throw new UnauthorizedException();
  	}
		await this.commandBus.execute(new UndoIsLoginFlagCommand(result.id))
  	res.clearCookie('refreshToken');
  	return this.commandBus.execute(new DeleteSessionCommand(result.deviceId));
  }
	// ----------------------------------------------------------------------- //
  @UseGuards(ThrottlerIpGuard)
  @HttpCode(204)
  @Post('registration-confirmation')
  async registrationConfirmation(@Body() dto: FindUserByCodeDto) {
  	const foundedUser = await this.commandBus.execute(
  		new FindUserByConfirmationCodeCommand(dto.code),
  	);
  	if (!foundedUser || foundedUser.isConfirmed === true) {
  		throw new BadRequestException([
  			{
  				message: 'wrong code',
  				field: 'code',
  			},
  		]);
  	}
  	return await this.commandBus.execute(new UpdateConfirmationCodeCommand(dto.code));
  }
  // ----------------------------------------------------------------------- //
	@UseGuards(ThrottlerIpGuard)
  @HttpCode(204)
  @Post('registration-email-resending')
  async registrationEmailResending(@Body() dto: EmailResendingDto, @Req() req: Request) {
  	const checkUserByEmail = await this.commandBus.execute(new GetAllUserInfoByEmailCommand(dto.email));
  	if (!checkUserByEmail) {
  		throw new BadRequestException([
  			{
  				message: 'email it does not exist',
  				field: 'email',
  			},
  		]);
  	}
  	if (checkUserByEmail.isConfirmed) {
  		throw new BadRequestException([
  			{
  				message: 'user has already verified',
  				field: 'email',
  			},
  		]);
  	}
  	return this.commandBus.execute(new SendNewConfirmEmailCommand(dto.email));
  }
  // ----------------------------------------------------------------------- //
	@UseGuards(ThrottlerIpGuard)
  @HttpCode(204)
  @Post('password-recovery')
  async passwordRecovery(@Body() dto: EmailResendingDto, @Req() req: Request) {
  	return await this.commandBus.execute(new SendRecoveryPasswordEmailCommand(dto.email));
  }
	// ----------------------------------------------------------------------- //
  @UseGuards(ThrottlerIpGuard)
  @HttpCode(204)
  @Post('new-password')
  async newPassword(@Body() dto: NewPasswordDto, @Req() req: Request) {
  	const user = await this.commandBus.execute(new GetAllUserInfoByRecoveryCodeCommand(dto.recoveryCode));
  	if (!user || user.recoveryCode !== dto.recoveryCode) {
  		throw new BadRequestException([
  			{
  				message: 'bad recoveryCode',
  				field: 'recoveryCode',
  			},
  		]);
  	}
  	return await this.commandBus.execute(
  		new SetNewPasswordCommand(dto.recoveryCode, dto.newPassword),
  	);
  }
  // ----------------------------------------------------------------------- //
	@HttpCode(200)
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: Request) {
  	const user = await this.commandBus.execute(new FindUserByIdCommand(req.user.id));
  	return {
  		email: user.email,
  		login: user.login,
  		userId: user.id,
  	};
  }
	// ----------------------------------------------------------------------- //
}
