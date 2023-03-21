import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../repository/sessions.repository';
import { JwtService } from '@nestjs/jwt';

export class CreateNewSessionCommand {
	constructor(
		public userIp: string,
		public userId: string,
		public refreshToken: string,
		public sessionTitle: string,
	) {}
}

@CommandHandler(CreateNewSessionCommand)
export class CreateNewSessionUseCase implements ICommandHandler<CreateNewSessionCommand> {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
		private readonly JwtService: JwtService,
	) {}

	async execute(command: CreateNewSessionCommand) {
		const { userIp, userId, refreshToken, sessionTitle } = command;
		const tokenPayload: any = await this.JwtService.decode(refreshToken);
		const session = {
			ip: userIp,
			title: sessionTitle,
			lastActiveDate: new Date(tokenPayload.iat * 1000).toISOString(),
			expiredDate: new Date(tokenPayload.exp * 1000).toISOString(),
			deviceId: tokenPayload.deviceId,
			userId: userId,
		};
		return await this.sessionsRepository.create(session);
	}
}
