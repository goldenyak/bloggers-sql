import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { FindUserByEmailCommand } from "../../users/use-cases/find-user-by-email.use-case";
import { SendEmailCommand } from "../../../../email/use-cases/send-email.use-case";
import { GetAllUserInfoByEmailCommand } from "../../users/use-cases/get-all-user-info-by-email-use.case";

export class SendConfirmEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendConfirmEmailCommand)
export class SendConfirmEmailUseCase implements ICommandHandler<SendConfirmEmailCommand> {
	constructor(
		private readonly commandBus: CommandBus,
	) {}

	async execute(command: SendConfirmEmailCommand) {
		const { email } = command;
		// const user = await this.commandBus.execute(new FindUserByEmailCommand(email));
		const user = await this.commandBus.execute(new GetAllUserInfoByEmailCommand(email))
		return this.commandBus.execute(new SendEmailCommand(email, user.confirmationCode));
	}
}
