import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UsersRepository } from "../../users/repository/users.repository";
import { SessionsRepository } from "../../sessions/repository/sessions.repository";
import { BlogsRepository } from "../../blogs/repository/blogs.repository";
import { CommentsRepository } from "../../comments/repository/comments.repository";
import { LikesRepository } from "../../likes/repository/likes.repository";
import { PostsRepository } from "../../posts/repository/posts.repository";

@Controller('testing')
export class DeleteAllController {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly sessionsRepository: SessionsRepository,
		private readonly blogsRepository: BlogsRepository,
		private readonly commentsRepository: CommentsRepository,
		private readonly likesRepository: LikesRepository,
		private readonly postsRepository: PostsRepository,
	) {}

	@HttpCode(204)
	@Delete('all-data')
	async deleteAll() {
		// await this.usersRepository.deleteAll();
		// await this.sessionsRepository.deleteAll();
		// await this.blogsRepository.deleteAll();
		// await this.commentsRepository.deleteAll();
		// await this.likesRepository.deleteAll();
		// await this.postsRepository.deleteAll();
		await this.usersRepository.nahui();

		return true;
	}
}
