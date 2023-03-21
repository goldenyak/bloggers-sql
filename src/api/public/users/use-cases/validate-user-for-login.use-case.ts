import { CommandBus, CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { HttpException, HttpStatus, UnauthorizedException } from "@nestjs/common";
import { compare } from "bcrypt";
import { FindUserByLoginCommand } from "./find-user-by-login.use-case";
import { GetAllUserInfoByEmailCommand } from "./get-all-user-info-by-email-use.case";
import { GetAllUserInfoByLoginCommand } from "./get-all-user-info-by-login-use.case";

export class ValidateUserForLoginCommand {
  constructor(public loginOrEmail: string, public password: string) {}
}

@CommandHandler(ValidateUserForLoginCommand)
export class ValidateUserForLoginUseCase implements ICommandHandler<ValidateUserForLoginCommand> {
  constructor(
    private readonly commandBus: CommandBus
  ) {}

  async execute(command: ValidateUserForLoginCommand) {
    const { loginOrEmail, password } = command;
    const user = await this.commandBus.execute(new GetAllUserInfoByLoginCommand(loginOrEmail))
    console.log(user);
    if (!user) {
      throw new UnauthorizedException()
    }
    if (user.isBanned || user.isLogin) {
      throw new UnauthorizedException()
    }
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      throw new UnauthorizedException()
    }
    return user;
  }
}