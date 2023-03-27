import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Users } from '../../../../entities/user/users.entity';
import { UpdateBanUserDto } from '../dto/update-ban-user.dto';
import { UpdateBanUserForBlogDto } from "../../blogs/dto/update-ban-user-for-blog.dto";
const { Client } = require('pg');

@Injectable()
export class UsersRepository {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(Users) private readonly userRepo: Repository<Users>,
  ) {}
  // -------------------------------------------------------------------------- //
  async createUser(
    login: string,
    passwordHash: string,
    email: string,
    confirmationCode: string,
    createdAt: string,
  ) {
    const userQuery = `
      WITH inserted_user AS (
        INSERT INTO public."Users"("login", "email", "isLogin")
        VALUES ($1, $2, false)
        RETURNING id
      )
      INSERT INTO public."User_profile"("userId", "password", "createdAt", "confirmationCode", "recoveryCode", "isConfirmed")
      VALUES ((SELECT id FROM inserted_user), $3, $4, $5, null, false)
      RETURNING (SELECT * FROM inserted_user)
    `;

    const res = await this.dataSource.query(userQuery, [
      login,
      email,
      passwordHash,
      createdAt,
      confirmationCode,
    ]);

    const banQuery = `
        INSERT INTO public."User_ban_info"("isBanned", "banDate", "banReason", "userId")
        VALUES (false, null, null, $1)
    `;
    return await this.dataSource.query(banQuery, [res[0].id]);
    // ------------------------------------------------------------------------- //
  }
  // ----------------------------------------------------------------- //
  async getAllBannedUsers(
    searchLoginTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    userId: string,
  ) {
    const query = `SELECT *
      FROM "Users"
      LEFT JOIN "User_profile" ON "Users"."id" = "User_profile"."userId"
      LEFT JOIN "User_ban_info" ON "Users"."id" = "User_ban_info"."userId"
      LEFT JOIN "Blogs" ON "Users"."id" = uuid("Blogs"."userId")
      WHERE ("login" ilike $1 AND "isBanned" = true AND "Blogs"."userId" = $2 )
      ORDER BY "User_profile"."${sortBy}" ${sortDirection}
      OFFSET $4 ROWS FETCH NEXT $3 ROWS ONLY
    `;
    const res = await this.dataSource.query(query, [
      '%' + searchLoginTerm + '%',
      userId,
      pageSize,
      (pageNumber - 1) * pageSize,
    ]);
    return res.map((user) => {
      return {
        id: user.userId,
        login: user.login,
        banInfo: {
          isBanned: user.isBanned,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      };
    });
  }
  // ----------------------------------------------------------------- //
  async getAllBannedUsersForBlog(
    searchLoginTerm: string,
    pageNumber: number,
    pageSize: number,
    sortBy: string,
    sortDirection: string,
    blogId: string,
  ) {
    if (sortBy === 'login') {
       sortBy = "bannedUserLogin"
    }
    const query = `
        SELECT *
          FROM "Black_list_blogs"
          WHERE ("bannedUserLogin" ilike $1 AND "blogId" = $2 )
          ORDER BY "${sortBy}" ${sortDirection}
          OFFSET $4 ROWS FETCH NEXT $3 ROWS ONLY
    `;
    const res = await this.dataSource.query(query, [
      '%' + searchLoginTerm + '%',
      blogId,
      pageSize,
      (pageNumber - 1) * pageSize,
    ]);
    return res.map((el) => {
      return {
        id: el.bannedUserId,
        login: el.bannedUserLogin,
        banInfo: {
          isBanned: true,
          banDate: el.createdAt,
          banReason: el.banReason
        },
      };
    });
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
  async banUser(id: string, dto: UpdateBanUserDto, banDate: string) {
    const query = `
     UPDATE "User_ban_info" 
     SET "isBanned" = $2, "banDate" = $4, "banReason" = $3
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [
      id,
      dto.isBanned,
      dto.banReason,
      banDate,
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
  async banUserForBlog(ownerId: string, bannedUserId: string, bannedUserLogin: string,  blogId: string, banDate: string, banReason: string) {
    const banQuery = `
        INSERT INTO public."Black_list_blogs"("ownerId", "bannedUserId", "bannedUserLogin", "blogId",  "createdAt", "banReason" )
        VALUES ($1, $2, $3, $4, $5, $6)
    `;
    return await this.dataSource.query(banQuery, [ownerId, bannedUserId, bannedUserLogin, blogId, banDate, banReason ]);
  }
  // ----------------------------------------------------------------- //
  async unbanUserForBlog( bannedUserId: string, blogId: string,) {
    const query = `
        DELETE FROM "Black_list_blogs" 
        WHERE ("bannedUserId" = $1 AND "blogId" = $2)
    `;
    return await this.dataSource.query(query, [bannedUserId, blogId]);
  }
  // ----------------------------------------------------------------- //
  async putIsLoginFlag(userId: string) {
    const query = `
     UPDATE "Users" 
     SET "isLogin" = true
     WHERE "id" = $1
    `;
    return await this.dataSource.query(query, [userId]);
  }
  // ----------------------------------------------------------------- //

  async undoIsLoginFlag(userId: string) {
    const query = `
     UPDATE "Users" 
     SET "isLogin" = false
     WHERE "id" = $1
    `;
    return await this.dataSource.query(query, [userId]);
  }
  // ----------------------------------------------------------------- //
  async deleteAll() {
    await this.dataSource.query(`DELETE FROM public."User_ban_info";`);
    await this.dataSource.query(`DELETE FROM public."User_profile";`);
    return await this.dataSource.query(`DELETE FROM public."Users";`);
  }
  // ----------------------------------------------------------------- //
  async countAllBannedUsers(
    searchLoginTerm: string,
    sortBy: string,
    sortDirection: string,
    userId: string,
  ) {
    const query = `
      SELECT COUNT(*)
      FROM "Users"
      LEFT JOIN "User_profile" ON "Users"."id" = "User_profile"."userId"
      LEFT JOIN "User_ban_info" ON "Users"."id" = "User_ban_info"."userId"
      LEFT JOIN "Blogs" ON "Users"."id" = uuid("Blogs"."userId")
      WHERE ("login" ilike $1 AND "isBanned" = true AND "Blogs"."userId" = $2 )
  `;
    const res = await this.dataSource.query(query, [
      '%' + searchLoginTerm + '%',
      userId,
    ]);
    const count = Number(res[0].count);
    return count;
  }
  // ----------------------------------------------------------------- //
  async countAllBannedUsersForBlog(
    searchLoginTerm: string,
    sortBy: string,
    sortDirection: string,
    blogId: string,
  ) {
    const query = `
      SELECT COUNT(*)
      FROM "Black_list_blogs"
      WHERE ("bannedUserLogin" ilike $1 AND "blogId" = $2 )
  `;
    const res = await this.dataSource.query(query, [
      '%' + searchLoginTerm + '%',
      blogId,
    ]);
    const count = Number(res[0].count);
    return count;
  }
  // ----------------------------------------------------------------- //
  async countAllUsers(
    banStatus: string,
    searchLoginTerm: string,
    searchEmailTerm: string,
  ) {
    const query = `
      SELECT COUNT(*)
      FROM "Users"
      LEFT JOIN "User_profile" ON "Users"."id" = "User_profile"."userId"
      LEFT JOIN "User_ban_info" ON "Users"."id" = "User_ban_info"."userId"
      LEFT JOIN "Session_info" ON "Users"."id" = "Session_info"."userId"
      WHERE
          (CAST($1 AS text) IS NULL OR "Users"."login" LIKE '%' || $1 || '%') AND
          (CAST($2 AS text) IS NULL OR "Users"."email" LIKE '%' || $2 || '%')
  `;
    const res = await this.dataSource.query(query, [
      searchLoginTerm,
      searchEmailTerm,
    ]);
    const count = Number(res[0].count);
    return count;
  }
  // ----------------------------------------------------------------- //
  async getUsersWithPagination(
    pageNumber,
    pageSize,
    searchLoginTerm,
    searchEmailTerm,
    sortBy,
    sortDirection,
    banStatus,
  ) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Users"
      LEFT JOIN "User_profile" ON "Users"."id" = "User_profile"."userId"
      LEFT JOIN "User_ban_info" ON "Users"."id" = "User_ban_info"."userId"
      LEFT JOIN "Session_info" ON "Users"."id" = "Session_info"."userId"
      WHERE ("Users"."login" ilike $1 OR "Users"."email" ilike $2)
            AND 
            CASE
            WHEN '${banStatus}' = 'notBanned' 
            THEN "User_ban_info"."isBanned" = false
            WHEN '${banStatus}' = 'banned' 
            THEN "User_ban_info"."isBanned" = true
            ELSE "User_ban_info"."isBanned" IN (true, false)
            END
  `;
    const countResult = await this.dataSource.query(countQuery, [
      '%' + searchLoginTerm + '%',
      '%' + searchEmailTerm + '%',
    ]);

    const dataQuery = `
      SELECT "Users"."id", "Users"."login", "Users"."email",
             "User_ban_info"."isBanned", "User_ban_info"."banDate", "User_ban_info"."banReason", "User_profile"."createdAt"
      FROM public."Users"
      LEFT JOIN "User_ban_info"  ON "Users"."id" = "User_ban_info"."userId"
      LEFT JOIN "User_profile" ON "Users"."id" = "User_profile"."userId"
      WHERE ("Users"."login" ilike $1 OR "Users"."email" ilike $2)
          AND
          CASE
          WHEN '${banStatus}' = 'notBanned'
          THEN "User_ban_info"."isBanned" = false
          WHEN '${banStatus}' = 'banned'
          THEN "User_ban_info"."isBanned" = true
          ELSE "User_ban_info"."isBanned" IN (true, false)
          END
      ORDER BY "${sortBy}" ${sortDirection}
      OFFSET $4 ROWS FETCH NEXT $3 ROWS ONLY
  `;

    const dataResult = await this.dataSource.query(dataQuery, [
      '%' + searchLoginTerm + '%',
      '%' + searchEmailTerm + '%',
      pageSize,
      (pageNumber - 1) * pageSize,
    ]);
    const pages = Math.ceil(countResult[0].count / pageSize);

    const mappedUser = dataResult.map((obj) => {
      return {
        id: obj.id,
        login: obj.login,
        createdAt: obj.createdAt,
        email: obj.email,
        banInfo: {
          banDate: obj.banDate,
          banReason: obj.banReason,
          isBanned: obj.isBanned,
        },
      };
    });
    return {
      pagesCount: pages,
      page: pageNumber,
      pageSize: pageSize,
      totalCount: +countResult[0].count,
      items: mappedUser,
    };
  }
  // ----------------------------------------------------------------- //
  async nahui() {
    await this.dataSource.query(`DELETE FROM public."User_ban_info"`);
    await this.dataSource.query(`DELETE FROM public."Blog_ban_info"`);
    await this.dataSource.query(`DELETE FROM public."User_profile"`);
    await this.dataSource.query(`DELETE FROM public."Users"`);
    await this.dataSource.query(`DELETE FROM public."Session_info"`);
    await this.dataSource.query(`DELETE FROM public."Blogs"`);
    await this.dataSource.query(`DELETE FROM public."Posts"`);
    await this.dataSource.query(`DELETE FROM public."Likes"`);
    await this.dataSource.query(`DELETE FROM public."Comments"`);
  }
}
// ----------------------------------------------------------------- //
