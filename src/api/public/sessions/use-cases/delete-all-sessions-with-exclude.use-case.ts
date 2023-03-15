import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from "../repository/sessions.repository";


export class DeleteAllSessionsWithExcludeCommand {
	constructor(public deviceId: string, public userId: string) {}
}

@CommandHandler(DeleteAllSessionsWithExcludeCommand)
export class DeleteAllSessionsWithExcludeUseCase implements ICommandHandler<DeleteAllSessionsWithExcludeCommand> {
	constructor(private readonly sessionsRepository: SessionsRepository) {}

	async execute(command: DeleteAllSessionsWithExcludeCommand) {
		const { deviceId, userId } = command;
		return await this.sessionsRepository.deleteAllSessionsWithExclude(deviceId, userId);
	}
}
