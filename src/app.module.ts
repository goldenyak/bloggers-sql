import { Module } from '@nestjs/common';
import { CreateNewUserUseCase } from './api/public/users/use-cases/create-new-user.use-case';
import { AuthController } from './api/public/auth/auth.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './api/public/users/repository/users.repository';
import { FindUserByLoginUseCase } from './api/public/users/use-cases/find-user-by-login.use-case';
import { FindUserByEmailUseCase } from './api/public/users/use-cases/find-user-by-email.use-case';
import { CheckUserByLoginOrEmailUseCase } from './api/public/users/use-cases/validate-user-for-register.use-case';
import { SendConfirmEmailUseCase } from './api/public/auth/use-cases/send-confirm-email.use-case';
import { EmailModule } from './email/email.module';
import { SendEmailUseCase } from './email/use-cases/send-email.use-case';
import { ThrottlerModule } from '@nestjs/throttler';
import { Users } from './entities/user/users.entity';
import { UserProfile } from './entities/user/user-profile.entity';
import { UserBanInfo } from './entities/user/user-ban-info.entity';
import { GetAllUserInfoByEmailUseCase } from './api/public/users/use-cases/get-all-user-info-by-email-use.case';
import { ValidateUserForLoginUseCase } from './api/public/users/use-cases/validate-user-for-login.use-case';
import { LoginUseCase } from './api/public/auth/use-cases/login.use-case';
import { CreateNewSessionUseCase } from './api/public/sessions/use-cases/create-new-session.use-case';
import { SessionsRepository } from './api/public/sessions/repository/sessions.repository';
import { GetAllUserInfoByLoginUseCase } from './api/public/users/use-cases/get-all-user-info-by-login-use.case';
import { SessionInfo } from './entities/sessions/session-info.entity';
import { CheckRefreshTokenUseCase } from './api/public/auth/use-cases/check-refresh-token.use-case';
import { GetLastActiveSessionUseCase } from './api/public/auth/use-cases/get-last-active-session.use-case';
import { CreateNewTokenUseCase } from './api/public/auth/use-cases/create-new-token.use-case';
import { GetLastActiveDateFromRefreshTokenUseCase } from './api/public/auth/use-cases/get-last-active-date-from-refresh-token.use-case';
import { UpdateSessionAfterRefreshUseCase } from './api/public/sessions/use-cases/update-session-after-refresh.use-case';
import { DeleteSessionUseCase } from './api/public/sessions/use-cases/delete-session.use-case';
import {
  FindUserByConfirmationCodeUseCase
} from "./api/public/users/use-cases/find-user-by-confirmation-code.use-case";
import { UpdateConfirmationCodeUseCase } from "./api/public/users/use-cases/update-confirmation-code.use-case";
import { AddNewConfirmationCodeByEmailUseCase } from "./api/public/auth/use-cases/add-new-confirmation-code.use-case";
import { SendNewConfirmEmailUseCase } from "./api/public/auth/use-cases/send-new-confirm-email.use-case";
import { SendRecoveryPasswordEmailUseCase } from "./email/use-cases/send-recovery-password-email.use-case";
import {
  GetAllUserInfoByRecoveryCodeUseCase
} from "./api/public/users/use-cases/get-all-user-info-by-recovery-code-use.case";
import { SetNewPasswordUseCase } from "./api/public/auth/use-cases/set-new-password.use-case";
import { FindUserByIdUseCase } from "./api/public/users/use-cases/find-user-by-id.use-case";
import { SessionsController } from "./api/public/sessions/controller/sessions.controller";
import { GetAllSessionsUseCase } from "./api/public/auth/use-cases/get-all-sessions.use-case";
import { GetSessionByDeviceIdUseCase } from "./api/public/auth/use-cases/get-session-by-device-id.use-case";
import {
  DeleteAllSessionsWithExcludeUseCase
} from "./api/public/sessions/use-cases/delete-all-sessions-with-exclude.use-case";
import { DeleteAllController } from "./api/public/delete-all/controller/delete-all.controller";
import { SuperAdminController } from "./api/super-admin/controller/super-admin.controller";
import { DeleteUserByIdUseCase } from "./api/public/users/use-cases/delete-user-by-id.use-case";
import { GetAllUserInfoByIdUseCase } from "./api/public/users/use-cases/get-all-user-info-by-id-use.case";
import { UnbanUserUseCase } from "./api/public/users/use-cases/unban-user.use-case";
import { BanUserUseCase } from "./api/public/users/use-cases/ban-user.use-case";
import {
  DeleteAllSessionForBanUserUseCase
} from "./api/public/sessions/use-cases/delete-all-session-for-ban-user.use-case";
import { GetAllUsersUseCase } from "./api/public/users/use-cases/get-all-users-use.case";
import { PutIsLoginFlagUseCase } from "./api/public/users/use-cases/put-is-login-flag.use-case";
import { UndoIsLoginFlagUseCase } from "./api/public/users/use-cases/undo-is-login-flag.use-case";

const controllers = [SuperAdminController, AuthController, SessionsController, DeleteAllController];

const repositories = [UsersRepository, SessionsRepository];

const usersUseCases = [
  CreateNewUserUseCase,
  ValidateUserForLoginUseCase,
  GetAllUsersUseCase,
  GetAllUserInfoByIdUseCase,
  GetAllUserInfoByEmailUseCase,
  GetAllUserInfoByLoginUseCase,
  GetAllUserInfoByRecoveryCodeUseCase,
  FindUserByLoginUseCase,
  FindUserByEmailUseCase,
  FindUserByIdUseCase,
  FindUserByConfirmationCodeUseCase,
  CheckUserByLoginOrEmailUseCase,
  UpdateConfirmationCodeUseCase,
  DeleteUserByIdUseCase,
  BanUserUseCase,
  UnbanUserUseCase,
];

const sessionsUseCases = [
  GetAllSessionsUseCase,
  GetSessionByDeviceIdUseCase,
  CreateNewSessionUseCase,
  UpdateSessionAfterRefreshUseCase,
  DeleteSessionUseCase,
  DeleteAllSessionsWithExcludeUseCase,
  DeleteAllSessionForBanUserUseCase,
];

const authUseCases = [
  LoginUseCase,
  PutIsLoginFlagUseCase,
  UndoIsLoginFlagUseCase,
  SendConfirmEmailUseCase,
  SendNewConfirmEmailUseCase,
  SendRecoveryPasswordEmailUseCase,
  AddNewConfirmationCodeByEmailUseCase,
  SendEmailUseCase,
  CheckRefreshTokenUseCase,
  GetLastActiveSessionUseCase,
  CreateNewTokenUseCase,
  GetLastActiveDateFromRefreshTokenUseCase,
  SetNewPasswordUseCase,
];

@Module({
  imports: [
    CqrsModule,
    EmailModule,
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
    }),
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: process.env.POSTGRES_HOST || 'localhost',
    //   port: 5432,
    //   username: process.env.POSTGRES_USER_NAME || 'egor',
    //   password: process.env.POSTGRES_PASSWORD || 'Iskanderlbgkjv1',
    //   database: process.env.POSTGRES_DATABASE || 'bloggers',
    //   entities: [Users, UserProfile, UserBanInfo, SessionInfo],
    //   synchronize: true,
    //   autoLoadEntities: true,
    // }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'egor',
      password: 'Iskanderlbgkjv1',
      database: 'bloggers',
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],
      entities: [Users, UserProfile, UserBanInfo, SessionInfo],
      synchronize: true,
      autoLoadEntities: true,
    }),
    TypeOrmModule.forFeature([Users]),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        ttl: config.get('THROTTLE_TTL'),
        limit: config.get('THROTTLE_LIMIT'),
      }),
    }),
  ],
  controllers: [...controllers],
  providers: [
    ...repositories,
    ...authUseCases,
    ...usersUseCases,
    ...sessionsUseCases,
  ],
})
export class AppModule {}
