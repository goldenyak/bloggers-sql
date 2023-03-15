import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { EmailService } from '../../../../email/email.service';
import { AddNewConfirmationCodeByEmailCommand } from "./add-new-confirmation-code.use-case";

export class SendNewConfirmEmailCommand {
	constructor(public email: string) {}
}

@CommandHandler(SendNewConfirmEmailCommand)
export class SendNewConfirmEmailUseCase implements ICommandHandler<SendNewConfirmEmailCommand> {
	constructor(
		private readonly emailService: EmailService,
		private readonly commandBus: CommandBus
	) {}

	async execute(command: SendNewConfirmEmailCommand) {
		const { email } = command;
		const newCode = await this.commandBus.execute(new AddNewConfirmationCodeByEmailCommand(email));
		return await this.emailService.sendNewConfirmEmail(email, newCode);
	}
}
