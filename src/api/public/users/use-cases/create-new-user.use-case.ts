import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

export class CreateNewUserCommand {
  constructor(
    public login: string,
    public password: string,
    public email: string,
  ) {}
}

@CommandHandler(CreateNewUserCommand)
export class CreateNewUserUseCase
  implements ICommandHandler<CreateNewUserCommand>
{
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: CreateNewUserCommand) {
    const { login, password, email } = command;
    const passwordHash = await hash(password, 10);
    const confirmationCode = uuidv4();
    return await this.usersRepository.createUser(
      login,
      passwordHash,
      email,
      confirmationCode,
    );
  }
}
