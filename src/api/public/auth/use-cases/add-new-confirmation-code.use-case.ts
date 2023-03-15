import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UsersRepository } from "../../users/repository/users.repository";

export class AddNewConfirmationCodeByEmailCommand {
  constructor(
    public email: string,
  ) {}
}

@CommandHandler(AddNewConfirmationCodeByEmailCommand)
export class AddNewConfirmationCodeByEmailUseCase
  implements ICommandHandler<AddNewConfirmationCodeByEmailCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: AddNewConfirmationCodeByEmailCommand) {
    const { email } = command;
    const newConfirmationCode = uuidv4();
    const user = await this.usersRepository.getAllUserInfoByEmail(email)
    await this.usersRepository.addNewConfirmationCodeByEmail(user.userId, newConfirmationCode);
    return newConfirmationCode;
  }
}
