import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { v4 as uuidv4 } from "uuid";
import { EmailService } from "../email.service";
import { UsersRepository } from "../../api/public/users/repository/users.repository";
import { GetAllUserInfoByEmailCommand } from "../../api/public/users/use-cases/get-all-user-info-by-email-use.case";


export class SendRecoveryPasswordEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendRecoveryPasswordEmailCommand)
export class SendRecoveryPasswordEmailUseCase implements ICommandHandler<SendRecoveryPasswordEmailCommand> {
	constructor(
		private readonly emailService: EmailService,
		private readonly usersRepository: UsersRepository,
		private readonly commandBus: CommandBus
	) {}

	async execute(command: SendRecoveryPasswordEmailCommand) {
		const { email } = command;
		const recoveryCode = uuidv4();
		const user = await this.commandBus.execute(new GetAllUserInfoByEmailCommand(email))
		await this.usersRepository.addRecoveryCode(user.userId, recoveryCode);
		return this.emailService.sendRecoveryPasswordEmail(email, recoveryCode);
	}
}
