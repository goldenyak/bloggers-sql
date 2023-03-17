import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../../../entities/user/users.entity';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}
  async createUser(
    login: string,
    passwordHash: string,
    email: string,
    confirmationCode: string,
  ) {
    const userQuery = `
      WITH inserted_user AS (
        INSERT INTO public."Users"("login", "email")
        VALUES ($1, $2)
        RETURNING id
      )
      INSERT INTO public."User_profile"("userId", "password", "createdAt", "confirmationCode", "recoveryCode", "isConfirmed")
      VALUES ((SELECT id FROM inserted_user), $3, NOW(), $4, null, false)
      RETURNING (SELECT * FROM inserted_user)
    `;

    const res = await this.dataSource.query(userQuery, [
      login,
      email,
      passwordHash,
      confirmationCode,
    ]);

    const banQuery = `
        INSERT INTO public."User_ban_info"("isBanned", "banDate", "banReason", "userId")
        VALUES (false, null, null, $1)
    `;
    return await this.dataSource.query(banQuery, [res[0].id]);
    // -------------------------------------------------------------- //
    // const client = await this.dataSource.getClient()
    //
    // try {
    //   await client.query('BEGIN');
    //
    //   const insertUserResult = await client.query(
    //     `INSERT INTO public."Users"("login", "email")
    //  VALUES ($1, $2)
    //  RETURNING id`,
    //     [login, email]
    //   );
    //
    //   const userId = insertUserResult.rows[0].id;
    //
    //   await client.query(
    //     `INSERT INTO public."User_profile"("userId", "password", "createdAt", "confirmationCode", "isConfirm")
    //  VALUES ($1, $2, NOW(), $3, false)`,
    //     [userId, passwordHash, confirmationCode]
    //   );
    //
    //   await client.query(
    //     `INSERT INTO public."User_ban_info"("isBanned", "banDate", "banReason", "userId")
    //  VALUES (false, null, null, $1)`,
    //     [userId]
    //   );
    //
    //   await client.query('COMMIT');
    //
    //   return 'Success';
    // } catch (error) {
    //   await client.query('ROLLBACK');
    //   throw error;
    // } finally {
    //   client.release();
    // }
    // ----------------------------------------------------------------- //
  }
  // ----------------------------------------------------------------- //
  async getAllUsers() {
    // const query = `SELECT *
    //   FROM "Users"
    //   LEFT JOIN "User_profile" ON "User_profile"."userId" = "Users"."id"
    //   LEFT JOIN "User_ban_info" ON "User_ban_info"."userId" = "Users"."id"
    //   LEFT JOIN "Session_info" ON "Session_info"."userId" = "Users"."id";
    // `;
    const query = `SELECT *
      FROM "Users"
      LEFT JOIN "User_profile" ON "Users".id = "User_profile"."userId"
      LEFT JOIN "User_ban_info" ON "Users".id = "User_ban_info"."userId"
      LEFT JOIN "Session_info" ON "Users".id = "Session_info"."userId";
    `;
    return await this.dataSource.query(query);
  }
  // ----------------------------------------------------------------- //
  async getAllUserInfoByEmail(email: string) {
    const query = `SELECT *
      FROM "Users"
      JOIN "User_profile" ON "User_profile"."userId" = "Users".id
      JOIN "User_ban_info" ON "User_ban_info"."userId" = "Users".id
      WHERE "Users"."email" = $1;
    `;
    return await this.dataSource.query(query, [email]);
  }
  // ----------------------------------------------------------------- //
  async getAllUserInfoById(id: string) {
    const query = `SELECT *
      FROM "Users"
      JOIN "User_profile" ON "User_profile"."userId" = "Users"."id"
      JOIN "User_ban_info" ON "User_ban_info"."userId" = "Users"."id"
      WHERE "Users"."id" = $1;
    `;
    return await this.dataSource.query(query, [id]);
  }
  // ----------------------------------------------------------------- //
  async getAllUserInfoByLogin(login: string) {
    const query = `SELECT *
      FROM "Users"
      JOIN "User_profile" ON "User_profile"."userId" = "Users".id
      JOIN "User_ban_info" ON "User_ban_info"."userId" = "Users".id
      WHERE "Users"."login" = $1;
    `;
    return await this.dataSource.query(query, [login]);
  }

  // ----------------------------------------------------------------- //
  // async createUser(
  //   login: string,
  //   passwordHash: string,
  //   email: string,
  //   confirmationCode: string,
  // ) {
  //   const user = new Users();
  //   user.email = email;
  //   user.login = login;
  //   return this.userRepo.save(user);
  // }
  // ----------------------------------------------------------------- //
  async findUserByLogin(login: string) {
    return await this.dataSource.query(
      `
       SELECT * FROM public."Users" WHERE "login" = $1
    `,
      [login],
    );
  }
  // ----------------------------------------------------------------- //
  async findUserByEmail(email: string) {
    return await this.dataSource.query(
      `
       SELECT * FROM public."Users" WHERE "email" = $1
    `,
      [email],
    );
  }
  // ----------------------------------------------------------------- //
  async findUserById(id: string) {
    return await this.dataSource.query(
      `
       SELECT * FROM public."Users" WHERE "id" = $1
    `,
      [id],
    );
  }
  // ----------------------------------------------------------------- //
  async findUserByConfirmationCode(confirmationCode: string) {
    return await this.dataSource.query(
      `
       SELECT * FROM public."User_profile" WHERE "confirmationCode" = $1
    `,
      [confirmationCode],
    );
  }
  // ----------------------------------------------------------------- //
  async deleteUserById(id: string) {
    await this.dataSource.query(
      `DELETE FROM "User_profile" WHERE "userId" = $1`,
      [id],
    );
    await this.dataSource.query(
      `DELETE FROM "User_ban_info" WHERE "userId" = $1`,
      [id],
    );
    await this.dataSource.query(
      `DELETE FROM "Session_info" WHERE "userId" = $1`,
      [id],
    );
    await this.dataSource.query(`DELETE FROM "Users" WHERE "id" = $1`, [id]);

    return;
  }
  // ----------------------------------------------------------------- //
  async updateConfirmationCode(confirmationCode: string) {
    const query = `
     UPDATE "User_profile" 
     SET "isConfirmed" = true
     WHERE "confirmationCode" = $1
    `;
    return await this.dataSource.query(query, [confirmationCode]);
  }
  // ----------------------------------------------------------------- //
  async addNewConfirmationCodeByEmail(
    userId: string,
    newConfirmationCode: string,
  ) {
    const query = `
     UPDATE "User_profile" 
     SET "confirmationCode" = $2
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [userId, newConfirmationCode]);
  }
  // ----------------------------------------------------------------- //
  async addRecoveryCode(userId: string, recoveryCode: string) {
    const query = `
     UPDATE "User_profile" 
     SET "recoveryCode" = $2
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [userId, recoveryCode]);
  }
  // ----------------------------------------------------------------- //

  async getAllUserInfoByRecoveryCode(recoveryCode: string) {
    return await this.dataSource.query(
      `
       SELECT * FROM public."User_profile" WHERE "recoveryCode" = $1
    `,
      [recoveryCode],
    );
  }
  // ----------------------------------------------------------------- //
  async setNewPassword(recoveryCode: string, passwordHash: string) {
    const query = `
     UPDATE "User_profile" 
     SET "password" = $2
     WHERE "recoveryCode" = $1
    `;
    return await this.dataSource.query(query, [recoveryCode, passwordHash]);
  }
  // ----------------------------------------------------------------- //
  async banUser(id: string, dto: UpdateBanUserDto) {
    const query = `
     UPDATE "User_ban_info" 
     SET "isBanned" = $2, "banDate" = null, "banReason" = $3
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [
      id,
      dto.isBanned,
      dto.banReason,
    ]);
  }
  // ----------------------------------------------------------------- //
  async unbanUser(id: string, dto: UpdateBanUserDto) {
    const query = `
     UPDATE "User_ban_info" 
     SET "isBanned" = $2, "banDate" = null, "banReason" = null
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [id, dto.isBanned]);
  }
  // ----------------------------------------------------------------- //
  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."User_ban_info";`);
    await this.dataSource.query(`DELETE FROM public."User_profile";`);
    return await this.dataSource.query(`DELETE FROM public."Users";`);
  }
  // ----------------------------------------------------------------- //

}
// ----------------------------------------------------------------- //
