import { Controller, Delete, HttpCode } from '@nestjs/common';
import { UsersRepository } from "../../users/repository/users.repository";
import { SessionsRepository } from "../../sessions/repository/sessions.repository";

@Controller('testing')
export class DeleteAllController {
	constructor(
		private readonly usersRepository: UsersRepository,
		private readonly sessionsRepository: SessionsRepository,
	) {}

	@HttpCode(204)
	@Delete('all-data')
	async deleteAll() {
		await this.usersRepository.deleteAll();
		await this.sessionsRepository.deleteAll();
		return true;
	}
}
