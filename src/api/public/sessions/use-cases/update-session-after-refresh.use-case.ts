import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from "../repository/sessions.repository";


export class UpdateSessionAfterRefreshCommand {
	constructor(public userId: string, public deviceId: string, public lastActiveDate: string, public newExpiredDate: string) {}
}

@CommandHandler(UpdateSessionAfterRefreshCommand)
export class UpdateSessionAfterRefreshUseCase implements ICommandHandler<UpdateSessionAfterRefreshCommand> {
	constructor(private readonly sessionsRepository: SessionsRepository) {}

	async execute(command: UpdateSessionAfterRefreshCommand) {
		const { userId, deviceId, lastActiveDate, newExpiredDate } = command;
		return await this.sessionsRepository.updateSessionAfterRefresh(userId, deviceId, lastActiveDate, newExpiredDate)
	}
}
