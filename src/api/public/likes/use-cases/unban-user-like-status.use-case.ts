import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from "../repository/likes.repository";

export class UnbanUserLikeStatusCommand {
	constructor(public id: string) {}
}

@CommandHandler(UnbanUserLikeStatusCommand)
export class UnbanUserLikeStatusUseCase implements ICommandHandler<UnbanUserLikeStatusCommand> {
	constructor(private readonly likesRepository: LikesRepository) {}

	async execute(command: UnbanUserLikeStatusCommand) {
		const { id } = command;
		console.log("hello");
		// return await this.likesRepository.unbanUserLikeStatus(id)
	}
}
