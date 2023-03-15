import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from "../../sessions/repository/sessions.repository";


export class GetSessionByDeviceIdCommand {
	constructor(public deviceId: string) {}
}

@CommandHandler(GetSessionByDeviceIdCommand)
export class GetSessionByDeviceIdUseCase implements ICommandHandler<GetSessionByDeviceIdCommand> {
	constructor(
		private readonly sessionsRepository: SessionsRepository,
	) {}

	async execute(command: GetSessionByDeviceIdCommand) {
		const { deviceId } = command;
		const session = await this.sessionsRepository.getSessionByDeviceId(deviceId)
		return session[0]
	}
}
