import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateBanBlogDto } from "../dto/update-ban-blog.dto";
import { BlogsRepository } from "../repository/blogs.repository";

export class BanBlogCommand {
	constructor(public id: string, public dto: UpdateBanBlogDto) {}
}

@CommandHandler(BanBlogCommand)
export class BanBlogUseCase implements ICommandHandler<BanBlogCommand> {
	constructor(private readonly blogsRepository: BlogsRepository) {}

	async execute(command: BanBlogCommand) {
		const { id, dto } = command;
		const banDate = new Date().toISOString()
		return await this.blogsRepository.banBlog(id, dto, banDate);
	}
}
