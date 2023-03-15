import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from "../../sessions/repository/sessions.repository";


export class GetAllSessionsCommand {
	constructor(public id: string) {}
}

@CommandHandler(GetAllSessionsCommand)
export class GetAllSessionsUseCase implements ICommandHandler<GetAllSessionsCommand> {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
	) {}

	async execute(command: GetAllSessionsCommand) {
		const { id } = command;
		const userSessions = await this.sessionsRepository.getAllSessions(id)
		return userSessions.map((el) => ({
			ip: el.ip,
			title: el.title,
			lastActiveDate: el.lastActiveDate,
			deviceId: el.deviceId,
		}));
	}
}
