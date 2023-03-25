import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class LikesRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // ------------------------------------------------------------------------- //
  async createLike(
    parentId: string,
    likeStatus: string,
    userId: string,
    userLogin: string,
    userBanStatus: string,
    createdAt: string,
  ) {
    const query = `
        WITH inserted_like AS (
          INSERT INTO public."Likes"("status", "createdAt", "parentId", "userId", "login", "userBanStatus")
          VALUES ($1, $2, $3, $4, $5, false)
          RETURNING id
        )
        SELECT id FROM inserted_like;
    `;
    const result = await this.dataSource.query(query, [
      likeStatus,
      createdAt,
      parentId,
      userId,
      userLogin,
    ]);
    return result[0];
  }
  // ------------------------------------------------------------------------- //
  async updateLikeStatus(
    parentId: string,
    likeStatus: string,
    userId: string,
    createdAt: string,
  ) {
    const query = `
     UPDATE "Likes" 
     SET "status" = $3, "createdAt" = $4
     WHERE ("Likes"."userId" = $1 AND "Likes"."parentId" = $2)
    `;
    return await this.dataSource.query(query, [
      userId,
      parentId,
      likeStatus,
      createdAt,
    ]);
  }
  // ------------------------------------------------------------------------- //
  async checkLikeStatus(userId: string, parentId: string) {
    const query = `SELECT *
      FROM "Likes"
        WHERE ("Likes"."userId" = $1 AND "Likes"."parentId" = $2)
    `;
    const res = await this.dataSource.query(query, [userId, parentId]);
    return res[0];
  }
  // ------------------------------------------------------------------------- //
  async banUserLikes(userId: string) {
    const query = `
     UPDATE "Likes" 
     SET "userBanStatus" = true
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [userId]);
  }
  // ------------------------------------------------------------------------- //
  async unbanUserLikes(userId: string) {
    const query = `
     UPDATE "Likes" 
     SET "userBanStatus" = false
     WHERE "userId" = $1
    `;
    return await this.dataSource.query(query, [userId]);
  }
  // ------------------------------------------------------------------------- //
  async getLikesCountByParentId(parentId: string) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Likes"
      WHERE ("Likes"."parentId" = $1 AND "Likes"."status" = 'Like')
  `;
    const countResult = await this.dataSource.query(countQuery, [parentId]);
    return countResult[0].count;
  }
  // ------------------------------------------------------------------------- //
  async getDislikesCountByParentId(parentId: string) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Likes"
      WHERE ("Likes"."parentId" = $1 AND "Likes"."status" = 'Dislike')
  `;
    const countResult = await this.dataSource.query(countQuery, [parentId]);
    return countResult[0].count;
  }
  // ------------------------------------------------------------------------- //
  async getNewestLikesByPostId(parentId: string, sortBy: string) {
    const query = `
      SELECT *
      FROM public."Likes"
      WHERE ("Likes"."parentId" = $1 AND "Likes"."status" = 'Like' AND "Likes"."userBanStatus" = false)
      ORDER BY "${sortBy}"
      LIMIT 3 
  `;
    const res = await this.dataSource.query(query, [parentId]);
    return res.map((el) => {
      return {
        addedAt: el.createdAt,
        userId: el.userId,
        login: el.login,
      };
    });
  }
  // ------------------------------------------------------------------------- //
  async deleteAll() {
    return await this.dataSource.query(`DELETE FROM public."Likes";`);
  }
}
