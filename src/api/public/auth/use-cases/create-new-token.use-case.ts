import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { JwtService } from '@nestjs/jwt';

export class CreateNewTokenCommand {
  constructor(
    public email: string,
    public id: string,
    public deviceId: string,
  ) {}
}

@CommandHandler(CreateNewTokenCommand)
export class CreateNewTokenUseCase
  implements ICommandHandler<CreateNewTokenCommand>
{
  constructor(private readonly JwtService: JwtService) {}

  async execute(command: CreateNewTokenCommand) {
    const { email, deviceId, id } = command;
    const newAccessToken = await this.JwtService.signAsync(
      { email, id },
      { expiresIn: process.env.ACCESS_TOKEN_EXPIRED_TIME },
    );
    const newRefreshToken = await this.JwtService.signAsync(
      { email, id, deviceId },
      { expiresIn: process.env.REFRESH_TOKEN_EXPIRED_TIME },
    );
    return {
      newAccessToken,
      newRefreshToken,
    };
  }
}
