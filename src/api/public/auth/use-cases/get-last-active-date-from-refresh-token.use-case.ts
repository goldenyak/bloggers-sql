import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

export class GetNewPayloadFromRefreshTokenCommand {
	constructor(public refreshToken: string) {}
}

@CommandHandler(GetNewPayloadFromRefreshTokenCommand)
export class GetLastActiveDateFromRefreshTokenUseCase implements ICommandHandler<GetNewPayloadFromRefreshTokenCommand> {
	constructor(
		private readonly JwtService: JwtService,
	) {}

	async execute(command: GetNewPayloadFromRefreshTokenCommand) {
		const { refreshToken } = command;
		const result: any = this.JwtService.decode(refreshToken);
		return result
	}
}
