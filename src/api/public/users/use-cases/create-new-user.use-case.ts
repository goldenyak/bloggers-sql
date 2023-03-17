import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';
import { hash } from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { GetAllUserInfoByLoginCommand } from './get-all-user-info-by-login-use.case';

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
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateNewUserCommand) {
    const { login, password, email } = command;
    const passwordHash = await hash(password, 10);
    const confirmationCode = uuidv4();
    const createdAt = new Date().toISOString();
    const createdUser = await this.usersRepository.createUser(
      login,
      passwordHash,
      email,
      confirmationCode,
      createdAt
    );
    if (createdUser) {
      const newUser = await this.commandBus.execute(
        new GetAllUserInfoByLoginCommand(login),
      );
      return {
        id: newUser.userId,
        login: newUser.login,
        email: newUser.email,
        createdAt: newUser.createdAt,
        banInfo: {
          isBanned: newUser.isBanned,
          banDate: newUser.banDate,
          banReason: newUser.banReason,
        },
      };
    }
  }
}
