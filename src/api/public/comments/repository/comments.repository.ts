import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CreateCommentDto } from '../dto/create-comment.dto';

@Injectable()
export class CommentsRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}
  // -------------------------------------------------------------------------- //
  async createComment(
    parentId: string,
    userId: string,
    userLogin: string,
    dto: CreateCommentDto,
    createdAt: string,
  ) {
    const query = `
        WITH inserted_comment AS (
          INSERT INTO public."Comments"("content", "createdAt", "parentId", "userId", "userLogin")
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        )
        SELECT id FROM inserted_comment;
    `;
    const result = await this.dataSource.query(query, [
      dto.content,
      createdAt,
      parentId,
      userId,
      userLogin
    ]);
    return result[0];
  }
  // -------------------------------------------------------------------------- //
  async getAllCommentInfoById(commentId: string) {
    const query = `SELECT *
      FROM "Comments"
      WHERE "Comments"."id" = $1;
    `;
    return await this.dataSource.query(query, [commentId]);
  }
  // -------------------------------------------------------------------------- //
  async getAllCommentsForPost(pageNumber: number, pageSize: number, sortBy: string, sortDirection: string, postId: string) {
    const dataQuery = `
      SELECT *
        FROM public."Comments"
        WHERE "Comments"."parentId" = $1

  `;

    const dataResult = await this.dataSource.query(dataQuery, [
      postId,

    ]);
    return dataResult.map((comment) => {
      return {
        id: comment.id,
        content: comment.content,
        commentatorInfo: {
          userId: comment.userId,
          userLogin: comment.userLogin
        },
        createdAt: comment.createdAt,
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: "None"
        }
      };
    });
  }
  // -------------------------------------------------------------------------- //
  //   async deletePostById(postId: string) {
  //     const query = `DELETE FROM "Posts" WHERE "id" = $1`;
  //     return await this.dataSource.query(query, [postId]);
  //   }
  // -------------------------------------------------------------------------- //
  //   async updatePostById(dto: UpdatePostDto, postId: string) {
  //     const query = `
  //      UPDATE "Posts"
  //      SET "title" = $1, "shortDescription" = $2, "content" = $3
  //      WHERE "id" = $4
  //     `;
  //     return await this.dataSource.query(query, [dto.title, dto.shortDescription, dto.content, postId]);
  //   }
  // -------------------------------------------------------------------------- //
  async countCommentsForPost(postId: string) {
    const countQuery = `
      SELECT COUNT(*)
      FROM public."Comments"
      WHERE ("Comments"."parentId" = $1)
  `;
    const countResult = await this.dataSource.query(countQuery, [postId]);
    return countResult[0].count;
  }
  // -------------------------------------------------------------------------- //
  async deleteAll() {
    return await this.dataSource.query(`DELETE FROM public."Comments";`);
  }
  // -------------------------------------------------------------------------- //

}
