
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanBlogDto } from "../dto/update-ban-blog.dto";
import { BlogsRepository } from "../repository/blogs.repository";

export class UnBanBlogCommand {
	constructor(public id: string, public dto: UpdateBanBlogDto) {}
}

@CommandHandler(UnBanBlogCommand)
export class UnBanBlogUseCase implements ICommandHandler<UnBanBlogCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: UnBanBlogCommand) {
		const { id, dto } = command;
		return await this.blogsRepository.unbanBlog(id, dto);
	}
}
