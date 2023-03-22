import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionsRepository } from '../repository/sessions.repository';
import { CheckRefreshTokenCommand } from '../../auth/use-cases/check-refresh-token.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { GetLastActiveSessionCommand } from '../../auth/use-cases/get-last-active-session.use-case';
import { CreateNewTokenCommand } from '../../auth/use-cases/create-new-token.use-case';
import { GetNewPayloadFromRefreshTokenCommand } from '../../auth/use-cases/get-last-active-date-from-refresh-token.use-case';
import { UpdateSessionAfterRefreshCommand } from './update-session-after-refresh.use-case';

export class UpdateDevicesCommand {
  constructor(public refreshToken: any) {}
}

@CommandHandler(UpdateDevicesCommand)
export class UpdateDevicesUseCase
  implements ICommandHandler<UpdateDevicesCommand>
{
  constructor(private readonly commandBus: CommandBus) {}

  async execute(command: UpdateDevicesCommand) {
    const { refreshToken } = command;
    const payload = await this.commandBus.execute(
      new CheckRefreshTokenCommand(refreshToken),
    );
    if (!payload) {
      throw new UnauthorizedException();
    }
    const iat = new Date(payload.iat * 1000).toISOString();
    const foundedDevice = await this.commandBus.execute(
      new GetLastActiveSessionCommand(payload.id, payload.deviceId, iat),
    );
    if (!foundedDevice) {
      return null;
    }
    const { newAccessToken, newRefreshToken } = await this.commandBus.execute(
      new CreateNewTokenCommand(payload.email, payload.id, payload.deviceId),
    );
    const newPayload = await this.commandBus.execute(
      new GetNewPayloadFromRefreshTokenCommand(newRefreshToken),
    );
    const newLastActiveDate = new Date(newPayload.iat * 1000).toISOString();
    const newExpiredDate = new Date(newPayload.exp * 1000).toISOString();
    await this.commandBus.execute(
      new UpdateSessionAfterRefreshCommand(
        newPayload.deviceId,
        newLastActiveDate,
        newExpiredDate,
      ),
    );
    return { newAccessToken, newRefreshToken }
  }
}
