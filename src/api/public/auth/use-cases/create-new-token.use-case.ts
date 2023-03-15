import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class CreateNewTokenCommand {
	constructor(public email: string, public id: string, public deviceId: string) {}
}

@CommandHandler(CreateNewTokenCommand)
export class CreateNewTokenUseCase implements ICommandHandler<CreateNewTokenCommand> {
	constructor(
		private readonly JwtService: JwtService,
	) {}

	async execute(command: CreateNewTokenCommand) {
		const { email, deviceId, id } = command;
		const newAccessToken = await this.JwtService.signAsync({ email, id }, { expiresIn: '24h' });
		const newRefreshToken = await this.JwtService.signAsync(
			{ email, id, deviceId },
			{ expiresIn: '24h' },
		);
		return {
			newAccessToken,
			newRefreshToken,
		};
	}
}
