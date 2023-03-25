import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LikesRepository } from "../repository/likes.repository";

export class CreateLikeCommand {
	constructor(public parentId: string, public userId: string, public userLogin: string, public userBanStatus: string, public likeStatus: string) {}
}

@CommandHandler(CreateLikeCommand)
export class CreateLikeUseCase implements ICommandHandler<CreateLikeCommand> {
	constructor(private readonly likesRepository: LikesRepository) {}

	async execute(command: CreateLikeCommand) {
		const { parentId, likeStatus, userId, userLogin, userBanStatus } = command;
		const checkLikeStatus = await this.likesRepository.checkLikeStatus(userId, parentId)
		if (!checkLikeStatus) {
			const createdAt = new Date().toISOString()
			return await this.likesRepository.createLike(parentId, likeStatus, userId, userLogin, userBanStatus, createdAt )
		}
 		if (checkLikeStatus && checkLikeStatus.status !== likeStatus) {
			const createdAt = new Date().toISOString()
			return await this.likesRepository.updateLikeStatus(parentId, likeStatus, userId, createdAt )
		}
	}
}
