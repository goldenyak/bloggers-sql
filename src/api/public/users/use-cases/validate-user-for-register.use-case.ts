import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../repository/users.repository';
import { FindUserByEmailCommand } from './find-user-by-email.use-case';
import { FindUserByLoginCommand } from './find-user-by-login.use-case';
import { BadRequestException } from '@nestjs/common';

export class CheckUserByLoginOrEmailCommand {
  constructor(public login: string, public email: string) {}
}

@CommandHandler(CheckUserByLoginOrEmailCommand)
export class CheckUserByLoginOrEmailUseCase
  implements ICommandHandler<CheckUserByLoginOrEmailCommand>
{
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CheckUserByLoginOrEmailCommand) {
    const { login, email } = command;
    const checkUserByEmail = await this.commandBus.execute(
      new FindUserByEmailCommand(email),
    );
    const checkUserByLogin = await this.commandBus.execute(
      new FindUserByLoginCommand(login),
    );
    const existsErrors = [];
    if (checkUserByLogin) {
      existsErrors.push({
        message: 'Такой login уже существует',
        field: 'login',
      });
    }
    if (checkUserByEmail) {
      existsErrors.push({
        message: 'Такой email уже существует',
        field: 'email',
      });
    }
    if (existsErrors.length > 0) {
      throw new BadRequestException(existsErrors);
    }
    // if (checkUserByEmail || checkUserByLogin) {
    //   throw new BadRequestException();
    // }
    // return await this.usersRepository.findUserByEmail(email);
  }
}
